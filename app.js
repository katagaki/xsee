"use strict";

/* ------------------------------------------------------------------ *
 * Scoring weights, sourced from the public feed ranking configuration
 * (home-mixer/params/param.rs).
 * ------------------------------------------------------------------ */
const WEIGHTS = {
  positive: [
    { key: "favorite",      label: "Favorite",            value: 0.5 },
    { key: "reply",         label: "Reply",               value: 5.0 },
    { key: "retweet",       label: "Repost",              value: 1.0 },
    { key: "quote",         label: "Quote",               value: 5.0 },
    { key: "share",         label: "Share",               value: 2.0 },
    { key: "shareDm",       label: "Share via DM",        value: 5.0 },
    { key: "shareCopyLink", label: "Share via copy link", value: 20.0 },
    { key: "followAuthor",  label: "Follow author",       value: 4.0 },
    { key: "click",         label: "Click",               value: 0.4 },
    { key: "openLink",      label: "Open link",           value: 0.2 },
    { key: "photoExpand",   label: "Photo expand",        value: 0.05 },
    { key: "videoOpen",     label: "Video open",          value: 0.05 },
    { key: "vqv",           label: "Quality video view",  value: 0.05 },
    { key: "quotedClick",   label: "Quoted post click",   value: 0.05 },
    { key: "profileClick",  label: "Profile click",       value: 0.0 },
    { key: "dwell",         label: "Dwell",               value: 0.0 },
  ],
  negative: [
    { key: "notDwelled",    label: "Not dwelled",    value: -0.02 },
    { key: "blockAuthor",   label: "Block author",   value: -31.2 },
    { key: "notInterested", label: "Not interested", value: -43.2 },
    { key: "muteAuthor",    label: "Mute author",    value: -58.8 },
    { key: "report",        label: "Report",         value: -234.0 },
  ],
  modifiers: [
    { key: "bidiReplyBoost", label: "Mutual-follow reply boost",   value: 15.0 },
    { key: "oonFactor",      label: "Out-of-network factor",       value: 0.75 },
    { key: "topicOonFactor", label: "Topic out-of-network factor", value: 0.5 },
    { key: "authorDecay",    label: "Author diversity decay",      value: 0.5 },
    { key: "authorFloor",    label: "Author diversity floor",      value: 0.25 },
    { key: "unexplored",     label: "Unexplored post weight",      value: 0.02 },
    { key: "contDwellTime",  label: "Continuous dwell time",       value: 0.004 },
  ],
};

const W = {};
for (const group of [WEIGHTS.positive, WEIGHTS.negative, WEIGHTS.modifiers]) {
  for (const w of group) W[w.key] = w.value;
}

/* ------------------------------------------------------------------ *
 * Random number generator (seeded per run so a run is reproducible
 * while it is on screen).
 * ------------------------------------------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Simulation
 * ------------------------------------------------------------------ */
const HANDLE_A = ["aria", "kite", "nova", "moss", "juno", "vex", "lumen", "orbit", "pixel", "quill", "sable", "tidal", "umber", "wren", "zephyr", "cinder"];
const HANDLE_B = ["dev", "art", "lab", "hq", "io", "jp", "za", "works", "daily", "club", "zone", "net", "fm", "co", "gg", "one"];
const MEDIA = ["Text", "Photo", "Video", "Link"];

function makeAuthor(rand, mutualProb) {
  return {
    handle: "@" + HANDLE_A[(rand() * HANDLE_A.length) | 0] + "_" + HANDLE_B[(rand() * HANDLE_B.length) | 0] + ((rand() * 90 + 10) | 0),
    mutual: rand() < mutualProb,
  };
}

function simulate(config) {
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
    const media = MEDIA[(rand() * MEDIA.length) | 0];
    const affinity = (inNetwork ? 0.5 + rand() * 0.5 : rand() * 0.7) * audienceDamp;

    // Predicted probability of each engagement action for this viewer.
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
    p.openLink      = media === "Link" ? rand() * 0.10 * affinity : 0;
    p.photoExpand   = media === "Photo" ? rand() * 0.12 * affinity : 0;
    p.videoOpen     = media === "Video" ? rand() * 0.12 * affinity : 0;
    p.vqv           = media === "Video" ? rand() * 0.15 * affinity : 0;
    p.quotedClick   = rand() * 0.02 * affinity;
    p.profileClick  = rand() * 0.03 * affinity;
    p.dwell         = rand() * 0.5;

    // Negative feedback, scaled by the configured rates with per-post jitter.
    const jitter = () => 0.2 + rand() * 1.6;
    const negBias = 1 + (1 - affinity) * 0.8;
    p.report        = config.rates.report * jitter() * negBias;
    p.blockAuthor   = config.rates.block * jitter() * negBias;
    p.muteAuthor    = config.rates.mute * jitter() * negBias;
    p.notInterested = config.rates.notInterested * jitter() * negBias;
    p.notDwelled    = 0.2 + rand() * 0.6;

    // Weighted sum of predicted actions.
    const contrib = {};
    let score = 0;
    for (const key of Object.keys(p)) {
      let weight = W[key];
      if (key === "reply" && author.mutual) weight += W.bidiReplyBoost;
      const c = weight * p[key];
      contrib[key] = c;
      score += c;
    }
    if (!inNetwork) score *= W.oonFactor;

    // Author diversity: repeated authors decay toward a floor.
    const priorCount = seenAuthors.get(author.handle) || 0;
    const diversity = Math.max(W.authorFloor, Math.pow(W.authorDecay, priorCount));
    seenAuthors.set(author.handle, priorCount + 1);
    score *= diversity;

    posts.push({ author, media, inNetwork, p, contrib, score });
  }

  posts.sort((a, b) => b.score - a.score);
  return posts;
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);
const fmt = (n, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n) => (n * 100).toFixed(n * 100 >= 10 ? 0 : 1) + "%";

const ACTION_LABELS = {};
for (const group of [WEIGHTS.positive, WEIGHTS.negative]) {
  for (const w of group) ACTION_LABELS[w.key] = w.label;
}

function renderFeed(posts) {
  const feed = $("feed");
  feed.textContent = "";

  const shown = posts.filter((p) => p.score >= 0);
  const suppressed = posts.length - shown.length;
  const inNet = posts.filter((p) => p.inNetwork).length;
  const scores = posts.map((p) => p.score).sort((a, b) => a - b);
  const median = scores[(scores.length / 2) | 0];

  $("stats").hidden = false;
  $("statShown").textContent = String(shown.length);
  $("statSuppressed").textContent = String(suppressed);
  $("statInNetwork").textContent = pct(inNet / posts.length);
  $("statMedian").textContent = fmt(median);

  posts.forEach((post, i) => {
    const el = document.createElement("article");
    el.className = "post" + (post.score < 0 ? " post--suppressed" : "");

    const rank = document.createElement("span");
    rank.className = "post-rank";
    rank.textContent = String(i + 1);

    const main = document.createElement("div");
    main.className = "post-main";

    const head = document.createElement("div");
    head.className = "post-head";
    const authorEl = document.createElement("span");
    authorEl.className = "post-author";
    authorEl.textContent = post.author.handle;
    const metaEl = document.createElement("span");
    metaEl.className = "post-meta";
    metaEl.textContent = [
      post.inNetwork ? "In network" : "Out of network",
      post.author.mutual ? "Mutual" : null,
      post.media,
    ].filter(Boolean).join(" · ");
    head.append(authorEl, metaEl);

    // Composition bar: positive vs negative contribution magnitude.
    let pos = 0, neg = 0;
    for (const c of Object.values(post.contrib)) c >= 0 ? (pos += c) : (neg += -c);
    const total = pos + neg || 1;
    const bar = document.createElement("div");
    bar.className = "bar";
    const segPos = document.createElement("span");
    segPos.className = "bar-seg bar-seg--pos";
    segPos.style.width = (pos / total * 100).toFixed(1) + "%";
    const segNeg = document.createElement("span");
    segNeg.className = "bar-seg bar-seg--neg";
    segNeg.style.width = (neg / total * 100).toFixed(1) + "%";
    bar.append(segPos, segNeg);

    // Top contributing actions, by absolute impact.
    const top = Object.entries(post.contrib)
      .filter(([, c]) => Math.abs(c) > 0.0005)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5);
    const actions = document.createElement("div");
    actions.className = "post-actions";
    for (const [key, c] of top) {
      const chip = document.createElement("span");
      if (c < 0) chip.className = "neg";
      chip.textContent = ACTION_LABELS[key] + " " + (c >= 0 ? "+" : "−") + fmt(Math.abs(c));
      actions.append(chip);
    }

    main.append(head, bar, actions);

    const scoreEl = document.createElement("div");
    scoreEl.className = "post-score";
    const scoreVal = document.createElement("span");
    scoreVal.className = "post-score-value" + (post.score < 0 ? " post-score-value--neg" : "");
    scoreVal.textContent = fmt(post.score);
    const scoreLabel = document.createElement("span");
    scoreLabel.className = "post-score-label";
    scoreLabel.textContent = post.score < 0 ? "suppressed" : "score";
    scoreEl.append(scoreVal, scoreLabel);

    el.append(rank, main, scoreEl);
    feed.append(el);
  });
}

/* ------------------------------------------------------------------ *
 * Weights page
 * ------------------------------------------------------------------ */
function renderWeights() {
  const root = $("weightsRoot");
  const groups = [
    { title: "Positive engagement", rows: WEIGHTS.positive, note: "Each predicted action probability is multiplied by its weight; the sum ranks the post." },
    { title: "Negative feedback", rows: WEIGHTS.negative, note: "A single likely report outweighs hundreds of likely favorites." },
    { title: "Modifiers", rows: WEIGHTS.modifiers, note: "Applied after the weighted sum: network origin, mutual follows, and author repetition scale the final score." },
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
    for (const t of ["Action", "", "Weight"]) {
      const th = document.createElement("th");
      th.textContent = t;
      if (t === "") th.className = "wbar-cell";
      headRow.append(th);
    }
    thead.append(headRow);
    const tbody = document.createElement("tbody");

    const sorted = [...group.rows].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    for (const row of sorted) {
      const tr = document.createElement("tr");
      const name = document.createElement("td");
      name.textContent = row.label;

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

function updateRateOutputs() {
  for (const id of RATE_IDS) {
    const v = Number($("rate" + id).value) * RATE_SCALE;
    $("rate" + id + "Value").textContent = (v * 100).toFixed(3) + "%";
  }
  $("postCountValue").textContent = $("postCount").value;
}

function run() {
  const config = {
    seed: (Math.random() * 2 ** 32) >>> 0,
    followers: Math.max(0, Number($("followers").value) || 0),
    following: Math.max(0, Number($("following").value) || 0),
    postCount: Number($("postCount").value),
    rates: readRates(),
  };
  renderFeed(simulate(config));
}

function randomizeRates() {
  for (const id of RATE_IDS) {
    $("rate" + id).value = String((Math.random() * 60) | 0);
  }
  updateRateOutputs();
  run();
}

/* ------------------------------------------------------------------ *
 * Tabs + init
 * ------------------------------------------------------------------ */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => {
      const active = t === tab;
      t.classList.toggle("tab--active", active);
      t.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".panel").forEach((p) => {
      p.hidden = p.id !== "panel-" + tab.dataset.tab;
    });
  });
});

document.querySelectorAll('input[type="range"]').forEach((el) => el.addEventListener("input", updateRateOutputs));
$("run").addEventListener("click", run);
$("randomizeRates").addEventListener("click", randomizeRates);

updateRateOutputs();
renderWeights();
run();
