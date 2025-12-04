import axios from "axios";
import { Job, Worker } from "bullmq";
import { ToxicityFlags } from "../../types/post.types";
import PostService from "../../modules/posts/posts.service";

interface FilterJobData {
  postID: string;
  caption: string;
}

const filterProcessor = async (job: Job<FilterJobData>): Promise<void> => {
  const { postID, caption } = job.data;
  console.log(`[Filter Worker] Starting toxicity check for post: ${postID}`);

  let result: ToxicityFlags;

  try {
    const response = await axios.post<{ result: string }>(
      process.env.TOXICITY_MODEL_URL as string,
      {
        text: caption,
      }
    );
    const modelResult: string = response.data.result;
    console.log(
      `[Filter Worker] Model returned: "${modelResult}" for post: ${postID}`
    );

    if (modelResult.includes("safe")) {
      result = ToxicityFlags.safe;
    } else if (modelResult.includes("BLOCKED")) {
      result = ToxicityFlags.blocked;
    } else {
      result = ToxicityFlags.flagged;
    }

    await PostService.getInstace().checkToxicity(result, postID);
  } catch (error) {
    console.error(
      `[Filter Worker] Error calling toxicity model for post ${postID}:`,
      error
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
      `[Filter Worker] Job ${job.id} for post ${job.data.postID} completed.`
    );
  });

  worker.on("failed", (job, err) => {
    console.error(
      `❌ Filter job ${job?.id} failed for post ${job?.data.postID} with error: ${err.message}`
    );
  });
  return worker;
};
