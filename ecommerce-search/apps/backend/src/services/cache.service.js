const store = new Map();

const DEFAULT_CAPACITY = 200;
const DEFAULT_TTL_MS = 30_000;

let capacity = DEFAULT_CAPACITY;
let ttl = DEFAULT_TTL_MS;

function configure({ maxEntries, ttlMs } = {}) {
  if (Number.isFinite(maxEntries) && maxEntries > 0) capacity = maxEntries;
  if (Number.isFinite(ttlMs) && ttlMs > 0) ttl = ttlMs;
}

function now() {
  return Date.now();
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expireAt < now()) {
    store.delete(key);
    return undefined;
  }
  entry.time = now();
  return entry.value;
}

function set(key, value) {
  const expireAt = now() + ttl;
  store.set(key, { value, expireAt, time: now() });
  if (store.size > capacity) {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [k, v] of store.entries()) {
      if (v.time < oldestTime) {
        oldestTime = v.time;
        oldestKey = k;
      }
    }
    if (oldestKey !== null) store.delete(oldestKey);
  }
}

function invalidateAll() {
  store.clear();
}

module.exports = {
  configure,
  get,
  set,
  invalidateAll
};
