const { Redis } = require("@upstash/redis");

class LocalRedisClient {
  constructor() {
    this.store = new Map();
    // Auto-cleanup expired entries every 30 seconds
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.expiresAt && entry.expiresAt <= now) {
          this.store.delete(key);
        }
      }
    }, 30000).unref();
  }

  async ping() {
    return "PONG";
  }

  async get(key) {
    if (!key) return null;
    const entry = this.store.get(String(key));
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(String(key));
      return null;
    }
    return entry.value;
  }

  async set(key, value, options = {}) {
    if (!key) return "ERR";
    let expiresAt = null;
    if (options && options.ex) {
      expiresAt = Date.now() + Number(options.ex) * 1000;
    }
    this.store.set(String(key), { value, expiresAt });
    return "OK";
  }

  async del(...keys) {
    let count = 0;
    const flatKeys = keys.flat().filter(Boolean);
    for (const key of flatKeys) {
      if (this.store.delete(String(key))) {
        count++;
      }
    }
    return count;
  }

  async incr(key) {
    if (!key) return 0;
    const strKey = String(key);
    const current = await this.get(strKey);
    const nextVal = (Number(current) || 0) + 1;
    const entry = this.store.get(strKey);
    this.store.set(strKey, {
      value: nextVal,
      expiresAt: entry ? entry.expiresAt : null,
    });
    return nextVal;
  }

  async flushdb() {
    this.store.clear();
    return "OK";
  }
}

let activeRedisClient = null;
let redisType = "local"; // "cloud" | "local"

function getRedisClient() {
  if (activeRedisClient) return activeRedisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

  if (url && token && !url.includes("<your-db>")) {
    try {
      const formattedUrl = url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

      activeRedisClient = new Redis({
        url: formattedUrl,
        token,
        retry: {
          retries: 1,
          backoff: () => 100,
        },
      });
      redisType = "cloud";
      return activeRedisClient;
    } catch {
      // Fallback below
    }
  }

  // Local embedded Redis engine
  activeRedisClient = new LocalRedisClient();
  redisType = "local";
  return activeRedisClient;
}

async function verifyRedisConnection() {
  const client = getRedisClient();

  if (redisType === "cloud") {
    try {
      const pingPromise = client.ping();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );
      await Promise.race([pingPromise, timeoutPromise]);
      return { connected: true, type: "cloud" };
    } catch {
      // Cloud ping failed, switch seamlessly to local in-memory Redis engine
      activeRedisClient = new LocalRedisClient();
      redisType = "local";
      return { connected: true, type: "local" };
    }
  }

  return { connected: true, type: "local" };
}

function isRedisActive() {
  return true;
}

module.exports = {
  getRedisClient,
  verifyRedisConnection,
  isRedisActive,
  LocalRedisClient,
};
