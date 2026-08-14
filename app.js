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
 * Your post
 * ------------------------------------------------------------------ */
function makeActor(rand) {
  let name = WORDS[(rand() * WORDS.length) | 0];
  if (rand() < 0.5) name += WORDS[(rand() * WORDS.length) | 0];
  return "@" + name + ((rand() * 1000) | 0);
}

function generatePost(config) {
  const rand = mulberry32(config.seed);
  const content = config.content;

  // Share of your audience that follows you back; boosts the reply weight.
  const mutualShare = Math.min(0.6, Math.min(config.followers, config.following) / Math.max(1, config.followers));
  // Bigger audiences engage slightly less per-impression.
  const audienceDamp = 1 / (1 + Math.log10(1 + config.followers) / 8);
  // Unknowable quality of this particular post.
  const quality = (0.3 + rand() * 0.7) * audienceDamp;

  // Predicted per-impression probability of each engagement action.
  const p = {};
  p.favorite      = rand() * 0.20 * quality;
  p.reply         = rand() * 0.04 * quality;
  p.retweet       = rand() * 0.06 * quality;
  p.quote         = rand() * 0.015 * quality;
  p.share         = rand() * 0.012 * quality;
  p.shareDm       = rand() * 0.006 * quality;
  p.shareCopyLink = rand() * 0.004 * quality;
  p.followAuthor  = rand() * 0.006 * quality;
  p.click         = rand() * 0.25 * quality;
  p.openLink      = content.link ? rand() * 0.10 * quality : 0;
  p.photoExpand   = content.photos > 0 ? rand() * 0.04 * content.photos * quality : 0;
  p.videoOpen     = content.video ? rand() * 0.12 * quality : 0;
  p.vqv           = content.video ? rand() * 0.15 * quality : 0;
  p.quotedClick   = rand() * 0.02 * quality;
  p.profileClick  = rand() * 0.03 * quality;
  p.dwell         = rand() * 0.5;
  p.notDwelled    = 0.2 + rand() * 0.6;

  // Per-post multiplier on the configured negative rates; the live
  // slider value is read every step, so mid-run changes apply.
  const jitter = () => 0.2 + rand() * 1.6;
  const negBias = 1 + (1 - quality) * 0.8;
  const negFactor = {};
  for (const key of Object.keys(NEG_RATE_KEYS)) negFactor[key] = jitter() * negBias;

  const counts = {};
  for (const key of ALL_ACTION_KEYS) counts[key] = 0;

  return {
    p, negFactor, mutualShare,
    impressions: 0, fracImp: 0, counts,
    contrib: {}, score: 0,
    milestoneIdx: 0, suppressed: false,
  };
}

function scorePost(post) {
  let score = 0;
  const denom = Math.max(1, post.impressions);
  for (const key of ALL_ACTION_KEYS) {
    let weight = W[key];
    if (key === "reply") weight += W.bidiReplyBoost * post.mutualShare;
    const c = weight * (post.counts[key] / denom);
    post.contrib[key] = c;
    score += c;
  }
  post.score = score;
}

/* ------------------------------------------------------------------ *
 * Timed run: 1 real second advances the simulated clock by 5 seconds.
 * ------------------------------------------------------------------ */
const SPEEDS = [1, 2, 5, 10, 20, 30, 60];
const currentSpeed = () => SPEEDS[Number($("speed").value)] || 5;
const RENDER_MS = 400;   // real ms between panel re-renders
const MAX_STEPS = 300;   // cap sim steps per frame so slow frames never freeze the page

let sim = null;

function startRun() {
  if (!WORDS.length) return;
  const followers = Math.max(0, Number($("followers").value) || 0);
  const durationSec = Number($("duration").value) * 60;
  const config = {
    seed: (Math.random() * 2 ** 32) >>> 0,
    followers,
    following: Math.max(0, Number($("following").value) || 0),
    durationSec,
    content: {
      photos: Number($("photos").value),
      video: $("hasVideo").checked,
      link: $("hasLink").checked,
    },
  };
  sim = {
    config,
    post: generatePost(config),
    rand: mulberry32(config.seed ^ 0x9e3779b9),
    elapsed: 0,
    carry: 0,
    duration: durationSec,
    baseReachPerMin: Math.min(20000, Math.max(2, followers * 0.05)),
    history: [],
    events: [],
    eventId: 0,
    lastRenderedEventId: 0,
    lastReal: performance.now(),
    lastRenderReal: 0,
    running: true,
    raf: 0,
  };
  logEvent({ kind: "posted" });
  $("timeline").textContent = "";
  $("clock").hidden = false;
  $("postCard").hidden = false;
  $("timelinePanel").hidden = false;
  const empty = document.querySelector(".results-grid .empty");
  if (empty) empty.remove();
  setRunButton(true);
  sim.raf = requestAnimationFrame(frame);
}

function stopRun() {
  if (sim && sim.running) {
    cancelAnimationFrame(sim.raf);
    sim.running = false;
    logEvent({ kind: "end" });
    renderPost();
    renderTimeline();
  }
  setRunButton(false);
}

const EVENT_CAP = 150;
// Only notable actions become timeline events; favorites and views
// would flood the log.
const EVENT_ACTIONS = ["followAuthor", "shareCopyLink"];
const MILESTONES = [1000, 10000, 100000, 1000000];

function logEvent(event) {
  if (!sim) return;
  event.time = sim.elapsed;
  event.id = ++sim.eventId;
  sim.events.push(event);
  if (sim.events.length > EVENT_CAP * 2) sim.events.splice(0, sim.events.length - EVENT_CAP);
}

// Every frame converts real time into whole simulated seconds and runs
// one fixed 1-second step per simulated second; speed only changes how
// many steps a frame performs.
function frame() {
  if (!sim || !sim.running) return;
  const now = performance.now();
  const realDt = Math.min(1000, now - sim.lastReal);
  sim.lastReal = now;
  sim.carry += (realDt / 1000) * currentSpeed();
  let steps = Math.min(MAX_STEPS, Math.floor(sim.carry));
  sim.carry -= steps;

  const rates = readRates();
  while (steps-- > 0 && sim.elapsed < sim.duration) {
    sim.elapsed += 1;
    stepSim(rates);
  }

  updateClock();
  if (now - sim.lastRenderReal >= RENDER_MS) {
    sim.lastRenderReal = now;
    sim.history.push({ t: sim.elapsed, score: sim.post.score });
    if (sim.history.length > 400) sim.history.shift();
    renderPost();
    renderTimeline();
  }

  if (sim.elapsed >= sim.duration) stopRun();
  else sim.raf = requestAnimationFrame(frame);
}

// One simulated second of your post's life. The score feeds back into
// distribution: a well-received post spreads out of network, a
// net-negative one is suppressed.
function stepSim(rates) {
  const post = sim.post;
  const age = sim.elapsed;
  // Reach decays with age (about a 3 hour half-life) and is amplified
  // or collapsed by the current score.
  const decay = Math.exp(-age / (3 * 3600));
  const amp = post.score < 0 ? 0.1 : 1 + Math.min(10, post.score * 4) * W.oonFactor;
  const perMin = sim.baseReachPerMin * decay * amp;
  const withCarry = perMin / 60 + post.fracImp;
  const n = Math.floor(withCarry);
  post.fracImp = withCarry - n;
  if (n > 0) {
    post.impressions += n;
    for (const key of POSITIVE_KEYS) {
      const hits = poisson(sim.rand, post.p[key] * n);
      post.counts[key] += hits;
      if (hits > 0 && EVENT_ACTIONS.includes(key)) {
        logEvent({ kind: "action", handle: makeActor(sim.rand), action: key, count: hits });
      }
    }
    post.counts.notDwelled += poisson(sim.rand, post.p.notDwelled * n);
    for (const [key, rateKey] of Object.entries(NEG_RATE_KEYS)) {
      const hits = poisson(sim.rand, rates[rateKey] * post.negFactor[key] * n);
      post.counts[key] += hits;
      if (hits > 0) {
        logEvent({ kind: "action", handle: makeActor(sim.rand), action: key, count: hits, negative: true });
      }
    }
    while (post.milestoneIdx < MILESTONES.length && post.impressions >= MILESTONES[post.milestoneIdx]) {
      logEvent({ kind: "milestone", views: MILESTONES[post.milestoneIdx] });
      post.milestoneIdx++;
    }
    scorePost(post);
    if (!post.suppressed && post.score < 0) {
      post.suppressed = true;
      logEvent({ kind: "suppressed", negative: true });
    } else if (post.suppressed && post.score >= 0) {
      post.suppressed = false;
      logEvent({ kind: "recovered" });
    }
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

function renderPost() {
  if (!sim) return;
  const post = sim.post;

  $("postMeta").textContent = [
    contentLabel(),
    fmtCompact(post.impressions) + " " + t("meta.views"),
  ].join(" · ");

  const scoreVal = $("postScore");
  scoreVal.className = "post-score-value" + (post.score < 0 ? " post-score-value--neg" : "");
  scoreVal.textContent = fmt(post.score);
  $("postScoreLabel").textContent = post.score < 0 ? t("post.suppressed") : t("post.score");

  let pos = 0, neg = 0;
  for (const c of Object.values(post.contrib)) c >= 0 ? (pos += c) : (neg += -c);
  const total = pos + neg || 1;
  $("barPos").style.width = (pos / total * 100).toFixed(1) + "%";
  $("barNeg").style.width = (neg / total * 100).toFixed(1) + "%";

  const top = Object.entries(post.contrib)
    .filter(([key, c]) => Math.abs(c) > 0.0005 && post.counts[key] > 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8);
  const actions = $("postActions");
  actions.textContent = "";
  for (const [key, c] of top) {
    const chip = document.createElement("span");
    if (c < 0) chip.className = "neg";
    chip.textContent = actionLabel(key) + " " + fmtCompact(post.counts[key]) + " (" + (c >= 0 ? "+" : "−") + fmt(Math.abs(c)) + ")";
    actions.append(chip);
  }

  // Score history sparkline.
  const svg = $("sparkline");
  const h = sim.history;
  if (h.length > 1) {
    let min = 0, max = 0;
    for (const pt of h) { if (pt.score < min) min = pt.score; if (pt.score > max) max = pt.score; }
    const span = max - min || 1;
    const points = h.map((pt, i) =>
      (i / (h.length - 1) * 300).toFixed(1) + "," + (56 - ((pt.score - min) / span) * 52 + 2).toFixed(1)
    ).join(" ");
    $("sparkPath").setAttribute("points", points);
    const zeroY = 56 - ((0 - min) / span) * 52 + 2;
    const zero = $("sparkZero");
    zero.setAttribute("y1", zeroY.toFixed(1));
    zero.setAttribute("y2", zeroY.toFixed(1));
  }

  // Stats: views, engagements, new followers, score.
  let engagements = 0;
  for (const key of POSITIVE_KEYS) if (key !== "dwell") engagements += post.counts[key];
  $("stats").hidden = false;
  $("statViews").textContent = fmtCompact(post.impressions);
  $("statEngagements").textContent = fmtCompact(engagements);
  $("statFollowers").textContent = fmtCompact(post.counts.followAuthor);
  $("statScore").textContent = fmt(post.score);
}

function buildTimelineItem(ev) {
  const li = document.createElement("li");
  li.className = "timeline-item" + (ev.negative ? " timeline-item--neg" : "");

  const time = document.createElement("span");
  time.className = "timeline-time";
  time.textContent = fmtHMS(ev.time);

  const text = document.createElement("span");
  text.className = "timeline-text";
  if (ev.kind === "posted") text.textContent = t("event.posted");
  else if (ev.kind === "end") text.textContent = t("event.end");
  else if (ev.kind === "suppressed") text.textContent = t("event.suppressed");
  else if (ev.kind === "recovered") text.textContent = t("event.recovered");
  else if (ev.kind === "milestone") text.textContent = fmtCompact(ev.views) + " " + t("meta.views");
  else text.textContent = ev.handle + " · " + actionLabel(ev.action) + (ev.count > 1 ? " ×" + ev.count : "");

  li.append(time, text);
  return li;
}

// Prepend only events that have not been rendered yet, fading them in.
function renderTimeline() {
  if (!sim) return;
  const list = $("timeline");
  const fresh = sim.events.filter((ev) => ev.id > sim.lastRenderedEventId);
  for (const ev of fresh) {
    const li = buildTimelineItem(ev);
    li.classList.add("timeline-item--enter");
    list.prepend(li);
    requestAnimationFrame(() => requestAnimationFrame(() => li.classList.remove("timeline-item--enter")));
    sim.lastRenderedEventId = ev.id;
  }
  while (list.children.length > EVENT_CAP) list.lastChild.remove();
}

// Full rebuild without animation, used on language switch.
function rebuildTimeline() {
  if (!sim) return;
  const list = $("timeline");
  list.textContent = "";
  const events = sim.events.slice(-EVENT_CAP);
  for (const ev of events) list.prepend(buildTimelineItem(ev));
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
  renderPost();
  rebuildTimeline();
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
  if (sim && sim.running) stopRun();
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
