const nlp = require("../services/nlp.service");
const catalog = require("../services/catalog.service");
const ranking = require("../services/ranking.service");
const index = require("../services/index.service");
const cache = require("../services/cache.service");

async function searchProducts(req, res, next) {
  try {
    const q = String(req.query.query || "").trim();
    if (!q) {
      return res
        .status(200)
        .json({ data: [], meta: { query: "", message: "empty query" } });
    }
    const analysis = nlp.analyze(q);
    const cached = cache.get(analysis.normalizedQuery);
    if (cached) {
      return res.status(200).json(cached);
    }
    const products = catalog.getAllProducts();
    if (!products.length) {
      return res.status(200).json({
        data: [],
        meta: { query: analysis.normalizedQuery, tokens: analysis.tokens },
      });
    }
    const candidateIds = index.queryTokens(analysis.tokens);
    const candidateSet = new Set(candidateIds);
    const candidates =
      candidateSet.size > 0
        ? products.filter((p) => candidateSet.has(p.id))
        : products;
    const ranked = ranking.rankProducts(candidates, {
      tokens: analysis.tokens,
      intent: analysis.intent,
    });
    const results = ranked.slice(0, 50).map(({ product, score }) => ({
      ...product,
      _score: score,
    }));
    const payload = {
      data: results,
      meta: {
        query: analysis.normalizedQuery,
        tokens: analysis.tokens,
        corrections: analysis.correctionsApplied,
      },
    };
    cache.set(analysis.normalizedQuery, payload);
    res.status(200).json(payload);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  searchProducts,
};
