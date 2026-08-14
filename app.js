"use strict";

/* ------------------------------------------------------------------ *
 * Localization
 * ------------------------------------------------------------------ */
const STRINGS = {
  en: {
    "tab.simulator": "Simulator",
    "tab.weights": "Weights",
    "section.account": "Account",
    "section.feed": "Feed",
    "section.rates": "Negative feedback rates",
    "section.timeline": "Timeline",
    "field.followers": "Followers",
    "field.following": "Following",
    "field.postCount": "Candidate posts",
    "field.duration": "Duration",
    "rate.block": "Block",
    "rate.mute": "Mute",
    "button.randomize": "Randomize rates",
    "button.run": "Start simulation",
    "button.stop": "Stop simulation",
    "stat.shown": "Shown",
    "stat.suppressed": "Suppressed",
    "stat.inNetwork": "In-network",
    "stat.median": "Median score",
    "feed.empty": "Start a simulation to rank a candidate feed over time.",
    "meta.inNetwork": "In network",
    "meta.outNetwork": "Out of network",
    "meta.mutual": "Mutual",
    "meta.views": "views",
    "media.text": "Text",
    "media.photo": "Photo",
    "media.video": "Video",
    "media.link": "Link",
    "post.score": "score",
    "post.suppressed": "suppressed",
    "post.pending": "not yet posted",
    "event.posted": "posted",
    "event.start": "Simulation started",
    "event.end": "Simulation ended",
    "action.favorite": "Favorite",
    "action.reply": "Reply",
    "action.retweet": "Repost",
    "action.quote": "Quote",
    "action.share": "Share",
    "action.shareDm": "Share via DM",
    "action.shareCopyLink": "Share via copy link",
    "action.followAuthor": "Follow author",
    "action.click": "Click",
    "action.openLink": "Open link",
    "action.photoExpand": "Photo expand",
    "action.videoOpen": "Video open",
    "action.vqv": "Quality video view",
    "action.quotedClick": "Quoted post click",
    "action.profileClick": "Profile click",
    "action.dwell": "Dwell",
    "action.notDwelled": "Not dwelled",
    "action.blockAuthor": "Block author",
    "action.notInterested": "Not interested",
    "action.muteAuthor": "Mute author",
    "action.report": "Report",
    "mod.bidiReplyBoost": "Mutual-follow reply boost",
    "mod.oonFactor": "Out-of-network factor",
    "mod.topicOonFactor": "Topic out-of-network factor",
    "mod.authorDecay": "Author diversity decay",
    "mod.authorFloor": "Author diversity floor",
    "mod.unexplored": "Unexplored post weight",
    "mod.contDwellTime": "Continuous dwell time",
    "weights.groupPositive": "Positive engagement",
    "weights.groupNegative": "Negative feedback",
    "weights.groupModifiers": "Modifiers",
    "weights.colAction": "Action",
    "weights.colWeight": "Weight",
    "weights.notePositive": "Each predicted action probability is multiplied by its weight; the sum ranks the post.",
    "weights.noteNegative": "A single likely report outweighs hundreds of likely favorites.",
    "weights.noteModifiers": "Applied after the weighted sum: network origin, mutual follows, and author repetition scale the final score.",
  },
  ja: {
    "tab.simulator": "シミュレーター",
    "tab.weights": "ウエイト",
    "section.account": "アカウント",
    "section.feed": "フィード",
    "section.rates": "ネガティブフィードバック率",
    "section.timeline": "タイムライン",
    "field.followers": "フォロワー",
    "field.following": "フォロー中",
    "field.postCount": "候補ポスト数",
    "field.duration": "シミュレーション時間",
    "rate.block": "ブロック",
    "rate.mute": "ミュート",
    "button.randomize": "率をランダム化",
    "button.run": "シミュレーション開始",
    "button.stop": "シミュレーション停止",
    "stat.shown": "表示",
    "stat.suppressed": "抑制",
    "stat.inNetwork": "ネットワーク内",
    "stat.median": "スコア中央値",
    "feed.empty": "シミュレーションを開始すると、候補フィードが時間経過でランク付けされます。",
    "meta.inNetwork": "ネットワーク内",
    "meta.outNetwork": "ネットワーク外",
    "meta.mutual": "相互フォロー",
    "meta.views": "表示",
    "media.text": "テキスト",
    "media.photo": "画像",
    "media.video": "動画",
    "media.link": "リンク",
    "post.score": "スコア",
    "post.suppressed": "抑制",
    "post.pending": "未投稿",
    "event.posted": "投稿",
    "event.start": "シミュレーション開始",
    "event.end": "シミュレーション終了",
    "action.favorite": "いいね",
    "action.reply": "返信",
    "action.retweet": "リポスト",
    "action.quote": "引用",
    "action.share": "共有",
    "action.shareDm": "DMで共有",
    "action.shareCopyLink": "リンクのコピーで共有",
    "action.followAuthor": "作成者をフォロー",
    "action.click": "クリック",
    "action.openLink": "リンクを開く",
    "action.photoExpand": "画像を拡大",
    "action.videoOpen": "動画を開く",
    "action.vqv": "動画の視聴",
    "action.quotedClick": "引用元のクリック",
    "action.profileClick": "プロフィールのクリック",
    "action.dwell": "滞在",
    "action.notDwelled": "滞在なし",
    "action.blockAuthor": "作成者をブロック",
    "action.notInterested": "興味がない",
    "action.muteAuthor": "作成者をミュート",
    "action.report": "報告",
    "mod.bidiReplyBoost": "相互フォロー返信ブースト",
    "mod.oonFactor": "ネットワーク外係数",
    "mod.topicOonFactor": "トピックネットワーク外係数",
    "mod.authorDecay": "作成者多様性の減衰",
    "mod.authorFloor": "作成者多様性の下限",
    "mod.unexplored": "未探索ポストのウエイト",
    "mod.contDwellTime": "継続滞在時間",
    "weights.groupPositive": "ポジティブエンゲージメント",
    "weights.groupNegative": "ネガティブフィードバック",
    "weights.groupModifiers": "修飾係数",
    "weights.colAction": "アクション",
    "weights.colWeight": "ウエイト",
    "weights.notePositive": "各アクションの予測確率にウエイトを掛け、その合計でポストをランク付けします。",
    "weights.noteNegative": "1件の報告の見込みは、数百件のいいねの見込みを上回ります。",
    "weights.noteModifiers": "加重合計の後に適用されます。ネットワークの内外、相互フォロー、作成者の重複が最終スコアを調整します。",
  },
};

let lang = localStorage.getItem("lang");
if (lang !== "en" && lang !== "ja") {
  lang = (navigator.language || "en").toLowerCase().startsWith("ja") ? "ja" : "en";
}
const t = (key) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;

/* ------------------------------------------------------------------ *
 * Scoring weights, sourced from the public feed ranking configuration
 * (home-mixer/params/param.rs).
 * ------------------------------------------------------------------ */
const WEIGHTS = {
  positive: [
    { key: "favorite",      value: 0.5 },
    { key: "reply",         value: 5.0 },
    { key: "retweet",       value: 1.0 },
    { key: "quote",         value: 5.0 },
    { key: "share",         value: 2.0 },
    { key: "shareDm",       value: 5.0 },
    { key: "shareCopyLink", value: 20.0 },
    { key: "followAuthor",  value: 4.0 },
    { key: "click",         value: 0.4 },
    { key: "openLink",      value: 0.2 },
    { key: "photoExpand",   value: 0.05 },
    { key: "videoOpen",     value: 0.05 },
    { key: "vqv",           value: 0.05 },
    { key: "quotedClick",   value: 0.05 },
    { key: "profileClick",  value: 0.0 },
    { key: "dwell",         value: 0.0 },
  ],
  negative: [
    { key: "notDwelled",    value: -0.02 },
    { key: "blockAuthor",   value: -31.2 },
    { key: "notInterested", value: -43.2 },
    { key: "muteAuthor",    value: -58.8 },
    { key: "report",        value: -234.0 },
  ],
  modifiers: [
    { key: "bidiReplyBoost", value: 15.0 },
    { key: "oonFactor",      value: 0.75 },
    { key: "topicOonFactor", value: 0.5 },
    { key: "authorDecay",    value: 0.5 },
    { key: "authorFloor",    value: 0.25 },
    { key: "unexplored",     value: 0.02 },
    { key: "contDwellTime",  value: 0.004 },
  ],
};

const W = {};
for (const group of [WEIGHTS.positive, WEIGHTS.negative, WEIGHTS.modifiers]) {
  for (const w of group) W[w.key] = w.value;
}

const POSITIVE_KEYS = WEIGHTS.positive.map((w) => w.key);
const NEG_RATE_KEYS = { report: "report", blockAuthor: "block", muteAuthor: "mute", notInterested: "notInterested" };
const ALL_ACTION_KEYS = [...POSITIVE_KEYS, "notDwelled", ...Object.keys(NEG_RATE_KEYS)];

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
const WORDS = [
  "amber", "aspen", "badger", "bramble", "breeze", "cedar", "cinder", "cloud",
  "clover", "comet", "coral", "crane", "cricket", "dune", "ember", "falcon",
  "fern", "flint", "fox", "garnet", "glacier", "grove", "harbor", "hazel",
  "heron", "juniper", "kestrel", "lagoon", "lantern", "lark", "lichen", "lotus",
  "maple", "marble", "meadow", "meteor", "mint", "moss", "nettle", "north",
  "otter", "pebble", "pine", "plume", "prairie", "quartz", "raven", "reed",
  "ridge", "river", "saffron", "sage", "sparrow", "spruce", "summit", "thistle",
  "tundra", "walnut", "willow", "wren",
];
const MEDIA = ["text", "photo", "video", "link"];

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
    const media = MEDIA[(rand() * MEDIA.length) | 0];
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
    p.openLink      = media === "link" ? rand() * 0.10 * affinity : 0;
    p.photoExpand   = media === "photo" ? rand() * 0.12 * affinity : 0;
    p.videoOpen     = media === "video" ? rand() * 0.12 * affinity : 0;
    p.vqv           = media === "video" ? rand() * 0.15 * affinity : 0;
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
      author, media, inNetwork, p, negFactor, diversity,
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
const SIM_SPEED = 5;
const TICK_MS = 400;
const RENDER_EVERY = 3; // re-rank the feed every 3rd tick

let sim = null;

function startRun() {
  const followers = Math.max(0, Number($("followers").value) || 0);
  const durationSec = Number($("duration").value) * 60;
  const config = {
    seed: (Math.random() * 2 ** 32) >>> 0,
    followers,
    following: Math.max(0, Number($("following").value) || 0),
    postCount: Number($("postCount").value),
    durationSec,
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
  const dt = (TICK_MS / 1000) * SIM_SPEED;
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

function renderFeed() {
  if (!sim) return;
  const feed = $("feed");
  feed.textContent = "";

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

  arrived.forEach((post, i) => {
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
      post.inNetwork ? t("meta.inNetwork") : t("meta.outNetwork"),
      post.author.mutual ? t("meta.mutual") : null,
      t("media." + post.media),
      fmtCompact(post.impressions) + " " + t("meta.views"),
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

    // Top contributing actions by absolute impact, with realized counts.
    const top = Object.entries(post.contrib)
      .filter(([key, c]) => Math.abs(c) > 0.0005 && post.counts[key] > 0)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5);
    const actions = document.createElement("div");
    actions.className = "post-actions";
    for (const [key, c] of top) {
      const chip = document.createElement("span");
      if (c < 0) chip.className = "neg";
      chip.textContent = actionLabel(key) + " " + fmtCompact(post.counts[key]) + " (" + (c >= 0 ? "+" : "−") + fmt(Math.abs(c)) + ")";
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
    scoreLabel.textContent = post.score < 0 ? t("post.suppressed") : t("post.score");
    scoreEl.append(scoreVal, scoreLabel);

    el.append(rank, main, scoreEl);
    feed.append(el);
  });
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

applyLanguage();
updateControlOutputs();
