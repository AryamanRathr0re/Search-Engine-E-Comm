const { normalizeText } = require('./nlp.service');

const baseline = new Map();

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function textRelevanceScore(product, tokens) {
  if (!tokens || tokens.length === 0) return 0;
  const hay = [
    String(product.name || '').toLowerCase(),
    String(product.brand || '').toLowerCase(),
    String(product.model || '').toLowerCase(),
    String(product.description || '').toLowerCase()
  ].join(' ');
  let hits = 0;
  for (const t of tokens) {
    if (!t) continue;
    if (hay.includes(String(t).toLowerCase())) hits += 1;
  }
  return hits / tokens.length;
}

function ratingScore(product) {
  const avg = Number(product.averageRating || 0);
  const count = Number(product.ratingCount || 0);
  const base = clamp(avg / 5, 0, 1);
  const confidence = clamp(count / 50, 0, 1);
  return base * (0.5 + 0.5 * confidence);
}

function salesScore(product, maxSales) {
  const s = Number(product.salesCount || 0);
  if (!maxSales || maxSales <= 0) return 0;
  return Math.log1p(s) / Math.log1p(maxSales);
}

function priceScore(product, minPrice, maxPrice, sentiment) {
  const p = Number(product.salePrice ?? product.price ?? 0);
  if (maxPrice <= minPrice) return 0;
  const norm = clamp((p - minPrice) / (maxPrice - minPrice), 0, 1);
  if (sentiment === 'cheap') return 1 - norm;
  if (sentiment === 'expensive') return norm;
  return 1 - Math.abs(norm - 0.5) * 2;
}

function stockScore(product) {
  if (!product.isAvailable) return 0;
  const stock = Number(product.stock || 0);
  return clamp(stock / 50, 0, 1);
}

function recencyScore(product) {
  const ref = new Date();
  const updated = product.updatedAt ? new Date(product.updatedAt) : ref;
  const days = Math.max(0, (ref - updated) / (1000 * 60 * 60 * 24));
  return 1 / (1 + days);
}

function computeBaseline(p, maxSales) {
  const sRating = ratingScore(p);
  const sSales = salesScore(p, maxSales);
  const sStock = stockScore(p);
  const sRecency = recencyScore(p);
  const W = { rating: 0.2, sales: 0.15, stock: 0.05, recency: 0.05 };
  return W.rating * sRating + W.sales * sSales + W.stock * sStock + W.recency * sRecency;
}

function registerProducts(products) {
  const maxSales = products.reduce((m, p) => Math.max(m, Number(p.salesCount || 0)), 0);
  for (const p of products) {
    baseline.set(p.id, computeBaseline(p, maxSales));
  }
}

function rankProducts(products, options = {}) {
  const query = options.query || '';
  const intent = options.intent || {};
  const tokens = options.tokens || (query ? normalizeText(query).split(' ').filter(Boolean) : []);
  const sentiment = intent.price?.sentiment || null;

  const prices = products.map((p) => Number(p.salePrice ?? p.price ?? 0)).filter((n) => Number.isFinite(n));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const maxSales = products.reduce((m, p) => Math.max(m, Number(p.salesCount || 0)), 0);

  const W = {
    text: 0.4,
    price: 0.15
  };

  const scored = products.map((p) => {
    const sText = textRelevanceScore(p, tokens);
    const sPrice = priceScore(p, minPrice, maxPrice, sentiment);
    const sBase = baseline.has(p.id) ? baseline.get(p.id) : computeBaseline(p, maxSales);
    const score = W.text * sText + W.price * sPrice + sBase;
    return { product: p, score, breakdown: { sText, sPrice, sBase } };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

module.exports = {
  rankProducts,
  registerProducts
};
