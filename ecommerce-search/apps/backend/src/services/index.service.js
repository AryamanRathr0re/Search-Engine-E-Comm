const { normalizeText } = require("./nlp.service");

const inverted = new Map();
const tokenCounts = new Map();

const STOP = new Set([
  "under",
  "below",
  "upto",
  "less",
  "max",
  "above",
  "over",
  "more",
  "min",
  "rs",
  "inr",
  "rupees",
  "usd",
  "dollar",
]);

function tokenizeField(s) {
  const norm = normalizeText(String(s || ""));
  return norm.split(" ").filter(Boolean);
}

function indexProduct(p) {
  const fields = [p.name, p.brand, p.model, p.description, p.color, p.storage];
  const tokens = fields.flatMap(tokenizeField);
  const id = p.id;
  const seen = new Set();
  for (const t of tokens) {
    if (!t) continue;
    let set = inverted.get(t);
    if (!set) {
      set = new Set();
      inverted.set(t, set);
    }
    set.add(id);
    if (!seen.has(t)) {
      seen.add(t);
      tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
    }
  }
}

function buildIndex(products) {
  inverted.clear();
  tokenCounts.clear();
  for (const p of products) indexProduct(p);
}

function updateIndexForProduct(p) {
  indexProduct(p);
}

function queryTokens(tokens) {
  const qTokens = tokens.filter((t) => t && !STOP.has(t));
  const scoreMap = new Map();
  for (const t of qTokens) {
    const set = inverted.get(t);
    if (!set) continue;
    for (const id of set) {
      scoreMap.set(id, (scoreMap.get(id) || 0) + 1);
    }
  }
  const arr = Array.from(scoreMap.entries());
  arr.sort((a, b) => b[1] - a[1]);
  const maxCandidates = 100;
  return arr.slice(0, maxCandidates).map(([id]) => id);
}

module.exports = {
  buildIndex,
  updateIndexForProduct,
  queryTokens,
};
