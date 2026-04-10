import { Job, Worker } from "bullmq";
import Redis from "ioredis"; // <-- Add this import
import sendMail from "../../core/utils/mailer";

interface EmailJobData {
  email: string;
  username: string;
  code: number;
  type: "code" | "otp";
}

const emailProcessor = async (job: Job<EmailJobData>) => {
  const { email, username, code, type } = job.data;
  console.log(`Sending ${type} email to: ${email}`);
  await sendMail(email, username, code, type);
};

export const setupEmailWorker = () => {
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST || "redis://127.0.0.1:6379";
  
  const workerConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });

  workerConnection.on("error", (err: any) => {
    if (err.code === 'ERR_SOCKET_BAD_PORT' || err.message.includes('NaN')) return;
    console.error("❌ Email Worker Redis Error:", err.message);
  });
  const worker = new Worker<EmailJobData>("email-queue", emailProcessor, {
    connection: workerConnection,
    concurrency: 5,
  });

  console.log(`Worker for email-queue started!`);

  worker.on("completed", (job: Job, returnValue: any) => {
    console.log(`Email job ${job.id} completed for ${job.data.email}.`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `Email job ${job?.id} failed for ${job?.data.email} with error: ${err.message}`,
    );
  });
  return worker;
};