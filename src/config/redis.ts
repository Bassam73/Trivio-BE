import Redis from "ioredis";

export default function redisConnection() {
  const redisUrl = process.env.REDIS_HOST || "redis://localhost:6379";

  const redisClient = new Redis(redisUrl, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis Connected Successfully!");
  });

  return redisClient;
}
