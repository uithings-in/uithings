const { getRedisClient, verifyRedisConnection } = require("./src/config/redis");
const dotenv = require("dotenv");
dotenv.config();

async function flush() {
  await verifyRedisConnection();
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.flushdb();
      console.log("✅ Redis cache flushed successfully.");
    } catch (e) {
      console.error("Failed to flush redis:", e.message);
    }
  } else {
    console.log("No redis client");
  }
}
flush();
