import { Queue } from "bullmq";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_HOST || "redis://127.0.0.1:6379";
const queueConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

const emailQueue = new Queue("email-queue", {
  connection: queueConnection,
});

export default emailQueue;
