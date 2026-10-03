const { getRedisClient, isRedisActive, markRedisInactive } = require("../config/redis");

// Cache TTLs in seconds (configurable via environment variables)
const TTL_LIST = Number(process.env.CACHE_TTL_LIST || 60);
const TTL_SINGLE = Number(process.env.CACHE_TTL_SINGLE || 300);
const TTL_MY = Number(process.env.CACHE_TTL_MY || 30);

// In-Memory fallback store for ultra-fast response and zero-downtime offline resilience
const memoryCache = new Map();
let memoryListVersion = 1;

// Periodically clean up expired entries in memory (every 60s)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt && entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}, 60000).unref();

/**
 * Retrieve cached data by key.
 * Tries local in-memory cache first, then Redis if active.
 */
async function cacheGet(key) {
  if (!key) return null;

  // 1. Check in-memory cache
  const localEntry = memoryCache.get(key);
  if (localEntry) {
    if (!localEntry.expiresAt || localEntry.expiresAt > Date.now()) {
      return localEntry.data;
    }
    memoryCache.delete(key);
  }

  // 2. Check Redis if available
  if (isRedisActive()) {
    try {
      const redis = getRedisClient();
      if (!redis) return null;

      // Timeout Redis get after 1.5 seconds to avoid slow queries
      const getPromise = redis.get(key);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis get timeout")), 1500)
      );

      const raw = await Promise.race([getPromise, timeoutPromise]);
      if (raw === null || raw === undefined) return null;

      let parsed = raw;
      if (typeof raw === "string") {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
      }

      // Save to local memory for subsequent ultra-fast access (short duration)
      memoryCache.set(key, {
        data: parsed,
        expiresAt: Date.now() + 30 * 1000,
      });

      return parsed;
    } catch (err) {
      // Non-blocking fallback
      return null;
    }
  }

  return null;
}

/**
 * Set cached data with a TTL in seconds.
 */
async function cacheSet(key, data, ttl = TTL_LIST) {
  if (!key || data === undefined) return;

  const ttlSeconds = Math.max(Number(ttl) || 60, 1);

  // 1. Save to in-memory cache
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  // 2. Save to Redis if active
  if (isRedisActive()) {
    try {
      const redis = getRedisClient();
      if (redis) {
        const serialized = typeof data === "string" ? data : JSON.stringify(data);
        await redis.set(key, serialized, { ex: ttlSeconds });
      }
    } catch (err) {
      // Ignore network errors and continue with in-memory cache
    }
  }
}

/**
 * Invalidate one or more cache keys.
 */
async function cacheInvalidate(...keys) {
  if (!keys || keys.length === 0) return;

  const validKeys = keys.filter(Boolean);

  // 1. Clear from in-memory cache
  for (const k of validKeys) {
    memoryCache.delete(k);
  }

  // 2. Clear from Redis if active
  if (isRedisActive()) {
    try {
      const redis = getRedisClient();
      if (redis && validKeys.length > 0) {
        await redis.del(...validKeys);
      }
    } catch (err) {
      // Ignore errors on delete
    }
  }
}

/**
 * Bump list version counter so all paginated component list queries invalidate immediately.
 */
async function bumpListVersion() {
  memoryListVersion += 1;

  if (isRedisActive()) {
    try {
      const redis = getRedisClient();
      if (redis) {
        const next = await redis.incr("components:list:version");
        memoryListVersion = Number(next) || memoryListVersion;
        return memoryListVersion;
      }
    } catch (err) {
      // Fallback to in-memory version
    }
  }

  return memoryListVersion;
}

/**
 * Get the current list version counter.
 */
async function getListVersion() {
  if (isRedisActive()) {
    try {
      const redis = getRedisClient();
      if (redis) {
        const val = await redis.get("components:list:version");
        if (val) {
          const num = Number(val);
          if (!Number.isNaN(num)) {
            memoryListVersion = num;
            return num;
          }
        }
      }
    } catch (err) {
      // Fallback
    }
  }

  return memoryListVersion;
}

function listKey(version, q, tag, page, limit, includeData, designType = "", pricingType = "", skip = 0) {
  return `components:list:v${version}:q=${q}:tag=${tag}:p=${page}:l=${limit}:s=${skip}:d=${includeData}:design=${designType}:price=${pricingType}`;
}

function componentKey(id) {
  return `components:id:${id}`;
}

function myListKey(version, userId, q, tag, page, limit, skip = 0) {
  return `components:my:v${version}:u=${userId}:q=${q}:tag=${tag}:p=${page}:l=${limit}:s=${skip}`;
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheInvalidate,
  bumpListVersion,
  getListVersion,
  listKey,
  componentKey,
  myListKey,
  TTL_LIST,
  TTL_SINGLE,
  TTL_MY,
};
