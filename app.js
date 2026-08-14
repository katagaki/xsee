"use strict";

/* ------------------------------------------------------------------ *
 * Localization
 * ------------------------------------------------------------------ */
let STRINGS = { en: {}, ja: {} };

let lang = localStorage.getItem("lang");
if (lang !== "en" && lang !== "ja") {
  lang = (navigator.language || "en").toLowerCase().startsWith("ja") ? "ja" : "en";
}
const t = (key) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;

/* ------------------------------------------------------------------ *
 * Scoring weights, sourced from the public feed ranking configuration
 * (home-mixer/params/param.rs).
 * ------------------------------------------------------------------ */
let WORDS = [];
let WEIGHTS = { positive: [], negative: [], modifiers: [] };
const W = {};
let POSITIVE_KEYS = [];
const NEG_RATE_KEYS = { report: "report", blockAuthor: "block", muteAuthor: "mute", notInterested: "notInterested" };
let ALL_ACTION_KEYS = [];

function setStaticData(data) {
  WORDS = data.usernameWords;
  WEIGHTS = data.weights;
  for (const group of [WEIGHTS.positive, WEIGHTS.negative, WEIGHTS.modifiers]) {
    for (const w of group) W[w.key] = w.value;
  }
  POSITIVE_KEYS = WEIGHTS.positive.map((w) => w.key);
  ALL_ACTION_KEYS = [...POSITIVE_KEYS, "notDwelled", ...Object.keys(NEG_RATE_KEYS)];
}

/* ------------------------------------------------------------------ *
 * Random number generator (seeded per run).
 * ------------------------------------------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t2 = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2;
    return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
  };
}

function poisson(rand, lambda) {
  if (lambda <= 0) return 0;
  if (lambda > 30) {
    // Normal approximation via Box-Muller for large rates.
    const g = Math.sqrt(-2 * Math.log(rand() || 1e-12)) * Math.cos(2 * Math.PI * rand());
    return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * g));
  }
  const limit = Math.exp(-lambda);
  let k = 0, prod = rand();
  while (prod > limit) { k++; prod *= rand(); }
  return k;
}

/* ------------------------------------------------------------------ *
 * Candidate generation
 * ------------------------------------------------------------------ */
function makeAuthor(rand, mutualProb) {
  let name = WORDS[(rand() * WORDS.length) | 0];
  if (rand() < 0.5) name += WORDS[(rand() * WORDS.length) | 0];
  return {
    handle: "@" + name + ((rand() * 1000) | 0),
    mutual: rand() < mutualProb,
  };
}

function generateCandidates(config) {
  const rand = mulberry32(config.seed);
  const posts = [];

  // Larger following -> more of the candidate pool is in-network.
  const inNetworkShare = Math.min(0.85, Math.max(0.1, config.following / (config.following + 1500)));
  // Balanced follower/following ratio -> more mutual follows.
  const ratio = config.followers / Math.max(1, config.following);
  const mutualProb = Math.min(0.6, 0.5 / (Math.abs(Math.log10(Math.max(ratio, 1e-6))) + 1));
  // Bigger audiences engage slightly less per-impression.
  const audienceDamp = 1 / (1 + Math.log10(1 + config.followers) / 8);

  const seenAuthors = new Map();

  for (let i = 0; i < config.postCount; i++) {
    const inNetwork = rand() < inNetworkShare;
    const author = makeAuthor(rand, inNetwork ? mutualProb : mutualProb * 0.1);
    const content = config.content;
    const affinity = (inNetwork ? 0.5 + rand() * 0.5 : rand() * 0.7) * audienceDamp;

    // Predicted per-impression probability of each engagement action.
    const p = {};
    p.favorite      = rand() * 0.20 * affinity;
    p.reply         = rand() * 0.04 * affinity;
    p.retweet       = rand() * 0.06 * affinity;
    p.quote         = rand() * 0.015 * affinity;
    p.share         = rand() * 0.012 * affinity;
    p.shareDm       = rand() * 0.006 * affinity;
    p.shareCopyLink = rand() * 0.004 * affinity;
    p.followAuthor  = inNetwork ? 0 : rand() * 0.008 * affinity;
    p.click         = rand() * 0.25 * affinity;
    p.openLink      = content.link ? rand() * 0.10 * affinity : 0;
    p.photoExpand   = content.photos > 0 ? rand() * 0.04 * content.photos * affinity : 0;
    p.videoOpen     = content.video ? rand() * 0.12 * affinity : 0;
    p.vqv           = content.video ? rand() * 0.15 * affinity : 0;
    p.quotedClick   = rand() * 0.02 * affinity;
    p.profileClick  = rand() * 0.03 * affinity;
    p.dwell         = rand() * 0.5;
    p.notDwelled    = 0.2 + rand() * 0.6;

    // Per-post multiplier on the configured negative rates; the live
    // slider value is read every tick, so mid-run changes apply.
    const jitter = () => 0.2 + rand() * 1.6;
    const negBias = 1 + (1 - affinity) * 0.8;
    const negFactor = {};
    for (const key of Object.keys(NEG_RATE_KEYS)) negFactor[key] = jitter() * negBias;

    // Author diversity: repeated authors decay toward a floor.
    const priorCount = seenAuthors.get(author.handle) || 0;
    const diversity = Math.max(W.authorFloor, Math.pow(W.authorDecay, priorCount));
    seenAuthors.set(author.handle, priorCount + 1);

    const counts = {};
    for (const key of ALL_ACTION_KEYS) counts[key] = 0;

    posts.push({
      author, inNetwork, p, negFactor, diversity,
      arrival: rand() * config.durationSec * 0.9,
      impressions: 0, fracImp: 0, counts,
      contrib: {}, score: 0,
      arrivedLogged: false, milestoneIdx: 0,
    });
  }
  return posts;
}

function scorePost(post) {
  let score = 0;
  const denom = Math.max(1, post.impressions);
  for (const key of ALL_ACTION_KEYS) {
    let weight = W[key];
    if (key === "reply" && post.author.mutual) weight += W.bidiReplyBoost;
    const c = weight * (post.counts[key] / denom);
    post.contrib[key] = c;
    score += c;
  }
  if (!post.inNetwork) score *= W.oonFactor;
  post.score = score * post.diversity;
}

/* ------------------------------------------------------------------ *
 * Timed run: 1 real second advances the simulated clock by 5 seconds.
 * ------------------------------------------------------------------ */
const SPEEDS = [1, 2, 5, 10, 20, 30, 60];
const currentSpeed = () => SPEEDS[Number($("speed").value)] || 5;
const TICK_MS = 400;
const RENDER_EVERY = 1; // feed nodes are reused, so every tick renders cheaply

let sim = null;

function startRun() {
  if (!WORDS.length) return;
  const followers = Math.max(0, Number($("followers").value) || 0);
  const durationSec = Number($("duration").value) * 60;
  const config = {
    seed: (Math.random() * 2 ** 32) >>> 0,
    followers,
    following: Math.max(0, Number($("following").value) || 0),
    postCount: Number($("postCount").value),
    durationSec,
    content: {
      photos: Number($("photos").value),
      video: $("hasVideo").checked,
      link: $("hasLink").checked,
    },
  };
  sim = {
    config,
    posts: generateCandidates(config),
    rand: mulberry32(config.seed ^ 0x9e3779b9),
    elapsed: 0,
    duration: durationSec,
    reachPerMin: Math.min(5000, Math.max(2, followers * 0.03)),
    tickCount: 0,
    events: [],
    timer: setInterval(tick, TICK_MS),
  };
  logEvent({ kind: "start" });
  $("feed").textContent = "";
  $("timeline").textContent = "";
  $("clock").hidden = false;
  $("timelinePanel").hidden = false;
  setRunButton(true);
  tick();
}

function stopRun() {
  if (sim && sim.timer) clearInterval(sim.timer);
  if (sim) {
    sim.timer = null;
    logEvent({ kind: "end" });
    renderTimeline();
  }
  setRunButton(false);
}

const EVENT_CAP = 150;
// Only notable actions become timeline events; favorites and views
// would flood the log.
const EVENT_ACTIONS = ["report", "blockAuthor", "muteAuthor", "notInterested", "followAuthor", "shareCopyLink"];
const MILESTONES = [1000, 10000, 100000, 1000000];

function logEvent(event) {
  if (!sim) return;
  event.time = sim.elapsed;
  sim.events.push(event);
  if (sim.events.length > EVENT_CAP * 2) sim.events.splice(0, sim.events.length - EVENT_CAP);
}

function tick() {
  if (!sim) return;
  const dt = (TICK_MS / 1000) * currentSpeed();
  sim.elapsed = Math.min(sim.elapsed + dt, sim.duration);
  const rates = readRates();

  for (const post of sim.posts) {
    if (post.arrival > sim.elapsed) continue;
    if (!post.arrivedLogged) {
      post.arrivedLogged = true;
      logEvent({ kind: "posted", handle: post.author.handle });
    }
    const age = sim.elapsed - post.arrival;
    // Impression rate decays as the post ages (about a 3 hour half-life).
    const perMin = sim.reachPerMin * Math.exp(-age / (3 * 3600));
    const withCarry = perMin * (dt / 60) + post.fracImp;
    const n = Math.floor(withCarry);
    post.fracImp = withCarry - n;
    if (n > 0) {
      post.impressions += n;
      for (const key of POSITIVE_KEYS) {
        const hits = poisson(sim.rand, post.p[key] * n);
        post.counts[key] += hits;
        if (hits > 0 && EVENT_ACTIONS.includes(key)) {
          logEvent({ kind: "action", handle: post.author.handle, action: key, count: hits });
        }
      }
      post.counts.notDwelled += poisson(sim.rand, post.p.notDwelled * n);
      for (const [key, rateKey] of Object.entries(NEG_RATE_KEYS)) {
        const hits = poisson(sim.rand, rates[rateKey] * post.negFactor[key] * n);
        post.counts[key] += hits;
        if (hits > 0) {
          logEvent({ kind: "action", handle: post.author.handle, action: key, count: hits, negative: true });
        }
      }
      while (post.milestoneIdx < MILESTONES.length && post.impressions >= MILESTONES[post.milestoneIdx]) {
        logEvent({ kind: "milestone", handle: post.author.handle, views: MILESTONES[post.milestoneIdx] });
        post.milestoneIdx++;
      }
    }
    scorePost(post);
  }

  updateClock();
  if (sim.tickCount % RENDER_EVERY === 0) {
    renderFeed();
    renderTimeline();
  }
  sim.tickCount++;

  if (sim.elapsed >= sim.duration) {
    stopRun();
    renderFeed();
    renderTimeline();
  }
}

function setRunButton(running) {
  const btn = $("run");
  btn.dataset.i18n = running ? "button.stop" : "button.run";
  btn.textContent = t(btn.dataset.i18n);
  btn.classList.toggle("btn--danger", running);
}

function fmtHMS(sec) {
  sec = Math.round(sec);
  const h = (sec / 3600) | 0;
  const m = ((sec % 3600) / 60) | 0;
  const s = sec % 60;
  return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function updateClock() {
  if (!sim) return;
  $("clockSpeed").textContent = currentSpeed() + "×";
  $("clockTime").textContent = fmtHMS(sim.elapsed) + " / " + fmtHMS(sim.duration);
  $("clockFill").style.width = ((sim.elapsed / sim.duration) * 100).toFixed(2) + "%";
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);
const fmt = (n, d = 2) => n.toLocaleString(lang === "ja" ? "ja-JP" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n) => (n * 100).toFixed(n * 100 >= 10 ? 0 : 1) + "%";
const fmtCompact = (n) => n < 1000 ? String(n) : n < 1e6 ? (n / 1e3).toFixed(1) + "K" : (n / 1e6).toFixed(1) + "M";

const actionLabel = (key) => t("action." + key);

function contentLabel() {
  const c = sim.config.content;
  const parts = [];
  if (c.photos > 0) parts.push(t("media.photo") + (c.photos > 1 ? " ×" + c.photos : ""));
  if (c.video) parts.push(t("media.video"));
  if (c.link) parts.push(t("media.link"));
  return parts.length ? parts.join(" · ") : t("media.text");
}

function buildPostEl(post) {
  const el = document.createElement("article");
  el.className = "post";

  const rank = document.createElement("span");
  rank.className = "post-rank";

  const main = document.createElement("div");
  main.className = "post-main";

  const head = document.createElement("div");
  head.className = "post-head";
  const author = document.createElement("span");
  author.className = "post-author";
  author.textContent = post.author.handle;
  const meta = document.createElement("span");
  meta.className = "post-meta";
  head.append(author, meta);

  const bar = document.createElement("div");
  bar.className = "bar";
  const segPos = document.createElement("span");
  segPos.className = "bar-seg bar-seg--pos";
  const segNeg = document.createElement("span");
  segNeg.className = "bar-seg bar-seg--neg";
  bar.append(segPos, segNeg);

  const actions = document.createElement("div");
  actions.className = "post-actions";

  main.append(head, bar, actions);

  const score = document.createElement("div");
  score.className = "post-score";
  const scoreVal = document.createElement("span");
  const scoreLabel = document.createElement("span");
  scoreLabel.className = "post-score-label";
  score.append(scoreVal, scoreLabel);

  el.append(rank, main, score);
  post.ui = { el, rank, meta, segPos, segNeg, actions, scoreVal, scoreLabel };
}

function updatePostEl(post, rank) {
  const ui = post.ui;
  ui.el.classList.toggle("post--suppressed", post.score < 0);
  ui.rank.textContent = String(rank + 1);
  ui.meta.textContent = [
    post.inNetwork ? t("meta.inNetwork") : t("meta.outNetwork"),
    post.author.mutual ? t("meta.mutual") : null,
    contentLabel(),
    fmtCompact(post.impressions) + " " + t("meta.views"),
  ].filter(Boolean).join(" · ");

  let pos = 0, neg = 0;
  for (const c of Object.values(post.contrib)) c >= 0 ? (pos += c) : (neg += -c);
  const total = pos + neg || 1;
  ui.segPos.style.width = (pos / total * 100).toFixed(1) + "%";
  ui.segNeg.style.width = (neg / total * 100).toFixed(1) + "%";

  const top = Object.entries(post.contrib)
    .filter(([key, c]) => Math.abs(c) > 0.0005 && post.counts[key] > 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5);
  ui.actions.textContent = "";
  for (const [key, c] of top) {
    const chip = document.createElement("span");
    if (c < 0) chip.className = "neg";
    chip.textContent = actionLabel(key) + " " + fmtCompact(post.counts[key]) + " (" + (c >= 0 ? "+" : "−") + fmt(Math.abs(c)) + ")";
    ui.actions.append(chip);
  }

  ui.scoreVal.className = "post-score-value" + (post.score < 0 ? " post-score-value--neg" : "");
  ui.scoreVal.textContent = fmt(post.score);
  ui.scoreLabel.textContent = post.score < 0 ? t("post.suppressed") : t("post.score");
}

function renderFeed() {
  if (!sim) return;
  const feed = $("feed");

  const arrived = sim.posts.filter((p) => p.arrival <= sim.elapsed);
  arrived.sort((a, b) => b.score - a.score);

  const shown = arrived.filter((p) => p.score >= 0);
  const inNet = arrived.filter((p) => p.inNetwork).length;
  const scores = arrived.map((p) => p.score).sort((a, b) => a - b);
  const median = scores.length ? scores[(scores.length / 2) | 0] : 0;

  $("stats").hidden = false;
  $("statShown").textContent = String(shown.length);
  $("statSuppressed").textContent = String(arrived.length - shown.length);
  $("statInNetwork").textContent = arrived.length ? pct(inNet / arrived.length) : "0%";
  $("statMedian").textContent = fmt(median);

  if (!arrived.length) return;
  const empty = feed.querySelector(".empty");
  if (empty) empty.remove();

  // FLIP: record positions, reorder, then animate each node from its
  // old position to its new one instead of snapping.
  const oldTops = new Map();
  for (const post of arrived) {
    if (post.ui && post.ui.el.isConnected) oldTops.set(post, post.ui.el.getBoundingClientRect().top);
  }
  arrived.forEach((post, i) => {
    if (!post.ui) buildPostEl(post);
    updatePostEl(post, i);
    feed.append(post.ui.el);
  });
  for (const post of arrived) {
    const el = post.ui.el;
    const oldTop = oldTops.get(post);
    if (oldTop === undefined) {
      el.classList.add("post--enter");
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("post--enter")));
      continue;
    }
    const delta = oldTop - el.getBoundingClientRect().top;
    if (delta) {
      el.style.transition = "none";
      el.style.transform = "translateY(" + delta + "px)";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = "";
        el.style.transform = "";
      }));
    }
  }
}

function renderTimeline() {
  if (!sim) return;
  const list = $("timeline");
  list.textContent = "";
  const events = sim.events.slice(-EVENT_CAP);
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    const li = document.createElement("li");
    li.className = "timeline-item" + (ev.negative ? " timeline-item--neg" : "");

    const time = document.createElement("span");
    time.className = "timeline-time";
    time.textContent = fmtHMS(ev.time);

    const text = document.createElement("span");
    text.className = "timeline-text";
    if (ev.kind === "start") text.textContent = t("event.start");
    else if (ev.kind === "end") text.textContent = t("event.end");
    else if (ev.kind === "posted") text.textContent = ev.handle + " · " + t("event.posted");
    else if (ev.kind === "milestone") text.textContent = ev.handle + " · " + fmtCompact(ev.views) + " " + t("meta.views");
    else text.textContent = ev.handle + " · " + actionLabel(ev.action) + (ev.count > 1 ? " ×" + ev.count : "");

    li.append(time, text);
    list.append(li);
  }
}

/* ------------------------------------------------------------------ *
 * Weights page
 * ------------------------------------------------------------------ */
function renderWeights() {
  const root = $("weightsRoot");
  root.textContent = "";
  const groups = [
    { title: t("weights.groupPositive"), rows: WEIGHTS.positive, prefix: "action.", note: t("weights.notePositive") },
    { title: t("weights.groupNegative"), rows: WEIGHTS.negative, prefix: "action.", note: t("weights.noteNegative") },
    { title: t("weights.groupModifiers"), rows: WEIGHTS.modifiers, prefix: "mod.", note: t("weights.noteModifiers") },
  ];

  for (const group of groups) {
    const maxAbs = Math.max(...group.rows.map((r) => Math.abs(r.value)), 1e-9);
    const section = document.createElement("section");
    section.className = "weights-group";

    const h = document.createElement("h2");
    h.textContent = group.title;
    section.append(h);

    const table = document.createElement("table");
    table.className = "wtable";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    for (const text of [t("weights.colAction"), "", t("weights.colWeight")]) {
      const th = document.createElement("th");
      th.textContent = text;
      if (text === "") th.className = "wbar-cell";
      headRow.append(th);
    }
    thead.append(headRow);
    const tbody = document.createElement("tbody");

    const sorted = [...group.rows].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    for (const row of sorted) {
      const tr = document.createElement("tr");
      const name = document.createElement("td");
      name.textContent = t(group.prefix + row.key);

      const barCell = document.createElement("td");
      barCell.className = "wbar-cell";
      const wbar = document.createElement("div");
      wbar.className = "wbar";
      const fill = document.createElement("div");
      fill.className = "wbar-fill " + (row.value < 0 ? "wbar-fill--neg" : "wbar-fill--pos");
      // sqrt scale keeps small weights visible next to Report at -234.
      fill.style.width = (Math.sqrt(Math.abs(row.value) / maxAbs) * 100).toFixed(1) + "%";
      wbar.append(fill);
      barCell.append(wbar);

      const num = document.createElement("td");
      num.className = "num";
      num.textContent = fmt(row.value, Math.abs(row.value) < 0.1 && row.value !== 0 ? 3 : 2);
      tr.append(name, barCell, num);
      tbody.append(tr);
    }
    table.append(thead, tbody);
    section.append(table);

    const note = document.createElement("p");
    note.className = "wnote";
    note.textContent = group.note;
    section.append(note);

    root.append(section);
  }
}

/* ------------------------------------------------------------------ *
 * Language switching
 * ------------------------------------------------------------------ */
function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  $("langPicker").value = lang;
  renderWeights();
  renderFeed();
  renderTimeline();
}

$("langPicker").addEventListener("change", (e) => {
  lang = e.target.value;
  localStorage.setItem("lang", lang);
  applyLanguage();
});

/* ------------------------------------------------------------------ *
 * Controls
 * ------------------------------------------------------------------ */
const RATE_SCALE = 0.00005; // slider 0..100 -> probability 0..0.5%
const RATE_IDS = ["Report", "Block", "Mute", "NotInterested"];

function readRates() {
  const rates = {};
  for (const id of RATE_IDS) {
    const key = id[0].toLowerCase() + id.slice(1);
    rates[key] = Number($("rate" + id).value) * RATE_SCALE;
  }
  return rates;
}

function updateControlOutputs() {
  for (const id of RATE_IDS) {
    const v = Number($("rate" + id).value) * RATE_SCALE;
    $("rate" + id + "Value").textContent = (v * 100).toFixed(3) + "%";
  }
  $("postCountValue").textContent = $("postCount").value;
  $("photosValue").textContent = $("photos").value;
  $("speedValue").textContent = currentSpeed() + "×";
  const mins = Number($("duration").value);
  $("durationValue").textContent = ((mins / 60) | 0) + ":" + String(mins % 60).padStart(2, "0");
}

function randomizeRates() {
  for (const id of RATE_IDS) {
    $("rate" + id).value = String((Math.random() * 60) | 0);
  }
  updateControlOutputs();
}

/* ------------------------------------------------------------------ *
 * Tabs + init
 * ------------------------------------------------------------------ */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((other) => {
      const active = other === tab;
      other.classList.toggle("tab--active", active);
      other.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".panel").forEach((p) => {
      p.hidden = p.id !== "panel-" + tab.dataset.tab;
    });
  });
});

document.querySelectorAll('input[type="range"]').forEach((el) => el.addEventListener("input", updateControlOutputs));
$("run").addEventListener("click", () => {
  if (sim && sim.timer) stopRun();
  else startRun();
});
$("randomizeRates").addEventListener("click", randomizeRates);

Promise.all([
  fetch("data.json").then((r) => r.json()),
  fetch("strings.json").then((r) => r.json()),
]).then(([data, strings]) => {
  setStaticData(data);
  STRINGS = strings;
  applyLanguage();
  updateControlOutputs();
});
