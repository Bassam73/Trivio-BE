import { Job, Worker } from "bullmq";
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
  const worker = new Worker<EmailJobData>("email-queue", emailProcessor, {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
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
