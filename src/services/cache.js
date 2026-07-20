// ─────────────────────────────────────────────────────────────────
//  src/services/cache.js  –  Simple in-process TTL cache
//  Reduces repeated API calls within the same session window.
// ─────────────────────────────────────────────────────────────────

const store = new Map(); // key → { value, expiresAt }
const TTL_MS = (parseInt(process.env.CACHE_TTL_SECONDS ?? "300", 10)) * 1000;

export const cache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },
  set(key, value, ttlMs = TTL_MS) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },
  invalidate(key) {
    store.delete(key);
  },
};
