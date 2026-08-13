"use strict";

/* ------------------------------------------------------------------ *
 * Localization
 * ------------------------------------------------------------------ */
const STRINGS = {
  en: {
    "app.subtitle": "Feed Algorithm Simulator",
    "tab.simulator": "Simulator",
    "tab.weights": "Weights",
    "section.account": "Account",
    "section.feed": "Feed",
    "section.rates": "Negative feedback rates",
    "field.followers": "Followers",
    "field.following": "Following",
    "field.postCount": "Candidate posts",
    "rate.block": "Block",
    "rate.mute": "Mute",
    "button.randomize": "Randomize rates",
    "button.run": "Run simulation",
    "stat.shown": "Shown",
    "stat.suppressed": "Suppressed",
    "stat.inNetwork": "In-network",
    "stat.median": "Median score",
    "feed.empty": "Run a simulation to rank a candidate feed.",
    "meta.inNetwork": "In network",
    "meta.outNetwork": "Out of network",
    "meta.mutual": "Mutual",
    "media.text": "Text",
    "media.photo": "Photo",
    "media.video": "Video",
    "media.link": "Link",
    "post.score": "score",
    "post.suppressed": "suppressed",
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
    "app.subtitle": "フィードアルゴリズムシミュレーター",
    "tab.simulator": "シミュレーター",
    "tab.weights": "重み",
    "section.account": "アカウント",
    "section.feed": "フィード",
    "section.rates": "ネガティブフィードバック率",
    "field.followers": "フォロワー",
    "field.following": "フォロー中",
    "field.postCount": "候補ポスト数",
    "rate.block": "ブロック",
    "rate.mute": "ミュート",
    "button.randomize": "率をランダム化",
    "button.run": "シミュレーション実行",
    "stat.shown": "表示",
    "stat.suppressed": "抑制",
    "stat.inNetwork": "ネットワーク内",
    "stat.median": "スコア中央値",
    "feed.empty": "シミュレーションを実行して候補フィードをランク付けします。",
    "meta.inNetwork": "ネットワーク内",
    "meta.outNetwork": "ネットワーク外",
    "meta.mutual": "相互フォロー",
    "media.text": "テキスト",
    "media.photo": "画像",
    "media.video": "動画",
    "media.link": "リンク",
    "post.score": "スコア",
    "post.suppressed": "抑制",
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
    "mod.unexplored": "未探索ポストの重み",
    "mod.contDwellTime": "継続滞在時間",
    "weights.groupPositive": "ポジティブエンゲージメント",
    "weights.groupNegative": "ネガティブフィードバック",
    "weights.groupModifiers": "修飾係数",
    "weights.colAction": "アクション",
    "weights.colWeight": "重み",
    "weights.notePositive": "各アクションの予測確率に重みを掛け、その合計でポストをランク付けします。",
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

const actionLabel = (key) => t("action." + key);

/* ------------------------------------------------------------------ *
 * Random number generator (seeded per run so a run is reproducible
 * while it is on screen).
 * ------------------------------------------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t2 = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2;
    return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Simulation
 * ------------------------------------------------------------------ */
const HANDLE_A = ["aria", "kite", "nova", "moss", "juno", "vex", "lumen", "orbit", "pixel", "quill", "sable", "tidal", "umber", "wren", "zephyr", "cinder"];
const HANDLE_B = ["dev", "art", "lab", "hq", "io", "jp", "za", "works", "daily", "club", "zone", "net", "fm", "co", "gg", "one"];
const MEDIA = ["text", "photo", "video", "link"];

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
    p.openLink      = media === "link" ? rand() * 0.10 * affinity : 0;
    p.photoExpand   = media === "photo" ? rand() * 0.12 * affinity : 0;
    p.videoOpen     = media === "video" ? rand() * 0.12 * affinity : 0;
    p.vqv           = media === "video" ? rand() * 0.15 * affinity : 0;
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
const fmt = (n, d = 2) => n.toLocaleString(lang === "ja" ? "ja-JP" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n) => (n * 100).toFixed(n * 100 >= 10 ? 0 : 1) + "%";

let lastPosts = null;

function renderFeed(posts) {
  lastPosts = posts;
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
      post.inNetwork ? t("meta.inNetwork") : t("meta.outNetwork"),
      post.author.mutual ? t("meta.mutual") : null,
      t("media." + post.media),
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
      chip.textContent = actionLabel(key) + " " + (c >= 0 ? "+" : "−") + fmt(Math.abs(c));
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
  document.title = "XSee — " + t("app.subtitle");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("lang-btn--active", btn.dataset.lang === lang);
  });
  renderWeights();
  if (lastPosts) renderFeed(lastPosts);
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    lang = btn.dataset.lang;
    localStorage.setItem("lang", lang);
    applyLanguage();
  });
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

document.querySelectorAll('input[type="range"]').forEach((el) => el.addEventListener("input", updateRateOutputs));
$("run").addEventListener("click", run);
$("randomizeRates").addEventListener("click", randomizeRates);

applyLanguage();
updateRateOutputs();
run();
