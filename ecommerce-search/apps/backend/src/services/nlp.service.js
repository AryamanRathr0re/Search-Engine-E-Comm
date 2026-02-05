function normalizeText(input) {
  const s = (input || '').normalize('NFKC').toLowerCase();
  const replaced = s
    .replace(/[\u20b9]/g, ' rs ')
    .replace(/[$]/g, ' usd ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return replaced;
}

const SPELLINGS = {
  ifone: 'iphone',
  aifone: 'iphone',
  iphne: 'iphone',
  iphon: 'iphone',
  samsng: 'samsung',
  samasung: 'samsung',
  samusng: 'samsung',
  pixel: 'pixel',
  oppo: 'oppo',
  xiaomi: 'xiaomi',
  redmi: 'redmi',
  onepluus: 'oneplus',
  oneplu: 'oneplus',
  nokiaa: 'nokia'
};

function correctSpelling(tokens) {
  const out = [];
  const corrections = [];
  for (const t of tokens) {
    const k = t.replace(/[^a-z0-9]/g, '');
    if (SPELLINGS[k]) {
      out.push(SPELLINGS[k]);
      corrections.push({ from: t, to: SPELLINGS[k] });
      continue;
    }
    out.push(t);
  }
  return { tokens: out, corrections };
}

const COLORS = {
  black: 'black',
  blue: 'blue',
  red: 'red',
  white: 'white',
  green: 'green',
  silver: 'silver',
  gold: 'gold',
  pink: 'pink',
  purple: 'purple',
  yellow: 'yellow',
  graphite: 'graphite',
  obsidian: 'obsidian',
  midnight: 'midnight',
  starlight: 'starlight',
  kaala: 'black',
  neela: 'blue',
  lal: 'red',
  safed: 'white',
  hara: 'green'
};

const HINGLISH = {
  sasta: 'cheap',
  mehenga: 'expensive',
  mehnga: 'expensive',
  budget: 'cheap'
};

function parseNumberWithMultipliers(s) {
  const m = String(s).match(/^(\d+(\.\d+)?)(k|lakh|lac|m)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const mul = m[3] ? m[3].toLowerCase() : '';
  if (mul === 'k') return Math.round(n * 1000);
  if (mul === 'lakh' || mul === 'lac') return Math.round(n * 100000);
  if (mul === 'm') return Math.round(n * 1000000);
  return Math.round(n);
}

function extractPrice(tokens) {
  let max = null;
  let min = null;
  let currency = null;
  let sentiment = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'rs' || t === 'inr' || t === 'rupees') currency = 'INR';
    if (t === 'usd' || t === 'dollar') currency = 'USD';
    if (HINGLISH[t]) sentiment = HINGLISH[t];
    if (['under', 'below', 'upto', 'less', 'max'].includes(t)) {
      const nxt = tokens[i + 1];
      const val = parseNumberWithMultipliers(nxt);
      if (val !== null) max = val;
    }
    if (['above', 'over', 'more', 'min'].includes(t)) {
      const nxt = tokens[i + 1];
      const val = parseNumberWithMultipliers(nxt);
      if (val !== null) min = val;
    }
    const val2 = parseNumberWithMultipliers(t);
    if (val2 !== null) {
      if (tokens[i - 1] && ['under', 'below', 'upto', 'less', 'max'].includes(tokens[i - 1])) {
        max = val2;
      } else if (tokens[i - 1] && ['above', 'over', 'more', 'min'].includes(tokens[i - 1])) {
        min = val2;
      }
    }
  }
  return { max, min, currency, sentiment };
}

function extractColor(tokens) {
  for (const t of tokens) {
    if (COLORS[t]) return COLORS[t];
  }
  return null;
}

function extractStorage(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const m = t.match(/^(\d+)(gb|tb)$/);
    if (m) return { value: parseInt(m[1], 10), unit: m[2].toUpperCase() };
    if (t.match(/^\d+$/) && i + 1 < tokens.length && ['gb', 'tb'].includes(tokens[i + 1])) {
      return { value: parseInt(t, 10), unit: tokens[i + 1].toUpperCase() };
    }
  }
  return { value: null, unit: null };
}

const BRANDS = ['iphone', 'apple', 'samsung', 'pixel', 'google', 'oneplus', 'xiaomi', 'redmi', 'oppo', 'vivo', 'nokia'];

function extractModel(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (BRANDS.includes(t)) {
      const next = tokens[i + 1] || '';
      const m1 = next.match(/^[a-z]*\d+[a-z]*$/);
      if (m1) return `${t} ${next}`;
      const next2 = tokens[i + 2] || '';
      const m2 = next2.match(/^[a-z]*\d+[a-z]*$/);
      if (m2) return `${t} ${next2}`;
    }
  }
  for (const t of tokens) {
    if (t.match(/^[a-z]*\d+[a-z]*$/)) return t;
  }
  return null;
}

function analyze(query) {
  const normalized = normalizeText(query);
  const baseTokens = normalized.split(' ').filter(Boolean);
  const { tokens, corrections } = correctSpelling(baseTokens);
  const flags = { hinglish: { sasta: tokens.includes('sasta'), mehenga: tokens.includes('mehenga') || tokens.includes('mehnga') } };
  const price = extractPrice(tokens);
  const color = extractColor(tokens);
  const storage = extractStorage(tokens);
  const model = extractModel(tokens);
  const brand = tokens.find((t) => BRANDS.includes(t)) || null;
  return {
    normalizedQuery: normalized,
    tokens,
    correctionsApplied: corrections,
    intent: {
      price,
      color,
      storage,
      model,
      brand
    },
    flags
  };
}

module.exports = {
  analyze,
  normalizeText,
  correctSpelling
};
