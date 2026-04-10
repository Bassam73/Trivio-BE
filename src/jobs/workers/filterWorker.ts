import axios from "axios";
import { Job, Worker } from "bullmq";
import { ToxicityFlags } from "../../types/post.types";
import PostService from "../../modules/posts/posts.service";
import CommentsService from "../../modules/comments/comments.service";
import { FilterJobData } from "../../types/global";
import NotificationService from "../../modules/notifications/notification.service";
import {
  EntityType,
  createNotificationDTO,
} from "../../types/notification.types";
import mongoose from "mongoose";
import UsersService from "../../modules/users/users.service";
import Redis from "ioredis";

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

    let authorId: string | undefined;
    let entityObjectId: mongoose.Types.ObjectId | undefined;
    let postID: string | undefined;
    if (result !== ToxicityFlags.safe) {
      if (filterType === "post") {
        const post = await PostService.getInstace().getPostbyId(id);
        if (post) {
          const rawAuthorId = post.authorID._id;
          authorId = rawAuthorId.toString();
          entityObjectId = post._id as unknown as mongoose.Types.ObjectId;
        }
      } else if (filterType === "comment") {
        const comment = await CommentsService.getInstance().getCommentByID(id);
        if (comment) {
          const rawUserId = (comment.userId as any)?._id ?? comment.userId;
          authorId = rawUserId.toString();
          entityObjectId = comment._id as unknown as mongoose.Types.ObjectId;
          postID = comment.postId as unknown as string;
        }
      }
    }

    if (filterType === "post") {
      await PostService.getInstace().checkToxicity(result, id);
    } else if (filterType === "comment") {
      await CommentsService.getInstance().checkToxicity(result, id);
    }

    if (
      (result === ToxicityFlags.flagged || result === ToxicityFlags.blocked) &&
      authorId &&
      entityObjectId
    ) {
      const authorObjectId = new mongoose.Types.ObjectId(authorId.toString());
      const isPost = filterType === "post";
      const message =
        result === ToxicityFlags.blocked
          ? `Your ${isPost ? "post" : "comment"} was removed for violating our community guidelines.`
          : `Your ${isPost ? "post" : "comment"} was flagged for review due to inappropriate content.`;

      if (result == ToxicityFlags.blocked && isPost) {
        await UsersService.getInstance().decrementUserPostsCount(authorId);
      }
      if (result == ToxicityFlags.blocked && !isPost && postID) {
        await PostService.getInstace().decrementCommentsCount(postID, 1);
      }
      const notifData: createNotificationDTO = {
        sender: authorObjectId,
        receiver: authorObjectId,
        message,
        entityID: entityObjectId,
        entityType: isPost ? EntityType.POST : EntityType.COMMENT,
        postId: isPost
          ? entityObjectId
          : postID
            ? new mongoose.Types.ObjectId(postID)
            : undefined,
      };

      try {
        await NotificationService.getInstance().createNotificaiton(notifData);
        console.log(
          `[Filter Worker] Notification sent to ${authorId} (${result})`,
        );
      } catch (notifErr) {
        console.error(`[Filter Worker] Failed to send notification:`, notifErr);
      }
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
  const redisUrl =
    process.env.REDIS_URL || process.env.REDIS_HOST || "redis://127.0.0.1:6379";
  const workerConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });
  workerConnection.on("error", (err: any) => {
    if (err.code === "ERR_SOCKET_BAD_PORT" || err.message.includes("NaN"))
      return;
    console.error("❌ Filter Worker Redis Error:", err.message);
  });

  const worker = new Worker<FilterJobData>("filter-queue", filterProcessor, {
    connection: workerConnection,
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
