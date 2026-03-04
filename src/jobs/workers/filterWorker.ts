import axios from "axios";
import { Job, Worker } from "bullmq";
import { ToxicityFlags } from "../../types/post.types";
import PostService from "../../modules/posts/posts.service";
import CommentsService from "../../modules/comments/comments.service";
import { FilterJobData } from "../../types/global";

const filterProcessor = async (job: Job<FilterJobData>): Promise<void> => {
  const { id, caption, filterType } = job.data;
  console.log(
    `[Filter Worker] Starting toxicity check for ${filterType}: ${id}`,
  );

  let result: ToxicityFlags;

  try {
    const response = await axios.post<{ result: string }>(
      process.env.TOXICITY_MODEL_URL as string,
      {
        text: caption,
      },
    );
    const modelResult: string = response.data.result;
    console.log(
      `[Filter Worker] Model returned: "${modelResult}" for ${filterType}: ${id}`,
    );

    if (modelResult.includes("safe")) {
      result = ToxicityFlags.safe;
    } else if (modelResult.includes("BLOCKED")) {
      result = ToxicityFlags.blocked;
    } else {
      result = ToxicityFlags.flagged;
    }

    if (filterType === "post") {
      await PostService.getInstace().checkToxicity(result, id);
    } else if (filterType === "comment") {
      await CommentsService.getInstance().checkToxicity(result, id);
    }
  } catch (error) {
    console.error(
      `[Filter Worker] Error calling toxicity model for ${filterType} ${id}:`,
      error,
    );
    throw error;
  }
};

export const setupFilterWorker = () => {
  const worker = new Worker<FilterJobData>("filter-queue", filterProcessor, {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
    concurrency: 10,
  });

  console.log(`✅ Worker for filter-queue started!`);

  worker.on("completed", (job: Job, returnValue: any) => {
    console.log(
      `[Filter Worker] Job ${job.id} for post ${job.data.id} completed.`,
    );
  });

  worker.on("failed", (job, err) => {
    console.error(
      `❌ Filter job ${job?.id} failed for post ${job?.data.id} with error: ${err.message}`,
    );
  });
  return worker;
};
