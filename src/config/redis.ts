import Redis from "ioredis";

const redisUrl = process.env.REDIS_HOST || "redis://localhost:6379";

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected Successfully!");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Connection/Authentication Error:", err);
});

export default redisClient;
