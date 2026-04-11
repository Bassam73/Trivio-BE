import { NextFunction, Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import PostService from "./posts.service";
import {
  createPostDTO,
  IPost,
  MediaType,
  updatePostDTO,
} from "../../types/post.types";
import mongoose from "mongoose";
import { createCommentDTO } from "../../types/comment.types";
import AppError from "../../core/utils/AppError";
import { uploadToCloudinary } from "../../core/utils/upload";
const service = PostService.getInstace();

const getPublicPosts = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userID = req.user?._id as string;
    const posts = await service.getPublicPosts(userID);
    res.status(200).json({ status: "success", data: { posts } });
  },
);
const createPost = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: createPostDTO = req.body;
    const files = req.files as { media?: Express.Multer.File[] };

    if (files?.media && files.media.length > 0) {
      console.log("we are in files");

      const uploadPromises = files.media.map((file) =>
        uploadToCloudinary(file, "posts"),
      );

      const uploadResults = await Promise.all(uploadPromises);
      data.media = uploadResults.map((result) => ({
        url: (result as any).secure_url,
        mediaType:
          (result as any).resource_type === "video"
            ? MediaType.reel
            : MediaType.image,
      }));
    }

    data.authorID = req.user?.id;
    const post = await service.createPost(data);
    res.status(201).json({ status: "success", data: { post } });
  },
);

const getPublicPostsById = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await service.getPublicPostsById(
      req.params.id,
      req.user?.id as unknown as string,
    );
    res.status(200).json({ status: "success", data });
  },
);

const getReels = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const reels = await service.getPublicReels();
    res.status(200).json({ status: "success", data: { reels } });
  },
);

const deletePostById = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    await service.deletePostById(req.params.id, req.user?.id);
    res.status(204).send();
  },
);

const updatePostById = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: updatePostDTO = {
      updatedData: req.body,
      postID: new mongoose.Types.ObjectId(req.params.id),
      userID: req.user?.id,
    };
    const post = await service.updatePostById(data);
    res.status(200).json({ status: "success", data: { post } });
  },
);

const sharePost = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const originalPostId = req.params.id;
    const userId = req.user?.id as unknown as string;
    
    if (!userId) throw new AppError("User not authenticated", 401);

    const post = await service.sharePost(userId, originalPostId, req.body);
    res.status(201).json({ status: "success", data: { post } });
  },
);

const createComment = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: createCommentDTO = {
      postId: req.params.id,
      userId: req.user?.id,
      text: req.body.text,
    };
    const comment = await service.createComment(data);
    res.status(201).json({ status: "success", data: { comment } });
  },
);

const getPostComments = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const comments = await service.getPostComments(req.params.id, req.query);
    res.status(200).json({ status: "success", data: comments });
  },
);

import ReactsService from "../reacts/reacts.service";
const reactsService = ReactsService.getInstance();

const createPostReaction = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const reaction = await reactsService.createReaction({
      userId,
      modelId: req.params.id,
      onModel: "post",
      reaction: req.body.reaction,
    });
    res.status(201).json({ status: "success", data: { reaction } });
  },
);

const getPostReactions = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const reactions = await reactsService.getReactionsByModelId(
      req.params.id,
      req.query,
    );
    res.status(200).json({ status: "success", data: reactions });
  },
);

export {
  createPost,
  getPublicPosts,
  getReels,
  getPublicPostsById,
  deletePostById,
  updatePostById,
  sharePost,
  createComment,
  getPostComments,
  createPostReaction,
  getPostReactions,
};
