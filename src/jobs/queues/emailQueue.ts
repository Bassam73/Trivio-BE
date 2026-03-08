import { Queue } from "bullmq";

const emailQueue = new Queue("email-queue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export default emailQueue;
