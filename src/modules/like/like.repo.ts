import { DeleteResult } from "mongoose";
import mongoose from "mongoose";

import likeModel from "../../database/models/like.model";
import postModel from "../../database/models/post.model";
import commentModel from "../../database/models/comment.model";

import { ILike } from "../../types/like.types";
import { IPost } from "../../types/post.types";
import { IComment } from "../../types/comment.types";

export default class LikeRepo {
  private static instance: LikeRepo;

  private constructor() {}

  async createLike(data: ILike): Promise<ILike> {
    return await likeModel.create(data);
  }

  async findLike(data: Partial<ILike>): Promise<ILike | null> {
    const query: any = { user: data.user };
    if (data.postId) query.postId = data.postId;
    if (data.commentId) query.commentId = data.commentId;
    return await likeModel.findOne(query);
  }
  async findLikeById(id: mongoose.Types.ObjectId): Promise<ILike | null> {
    return await likeModel.findById(id);
  }
  async updateLike(id: mongoose.Types.ObjectId, data: Partial<ILike>): Promise<ILike | null> {
    return await likeModel.findByIdAndUpdate(id, data, { new: true });
  }
  async updateComment(id: mongoose.Types.ObjectId, data: Partial<IComment>): Promise<IComment | null> {
    return await commentModel.findByIdAndUpdate(id, data, { new: true });
  }
  async updatePost(id: mongoose.Types.ObjectId, data: Partial<IPost>): Promise<IPost | null> {
    return await postModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteLike(id: mongoose.Types.ObjectId): Promise<DeleteResult> {
    return await likeModel.deleteOne({ _id: id });
  }

async incPostReaction(postId: string | Object, type: string, amount: number) {
    return postModel.updateOne(
        { _id: postId },
        { $inc: { [`reactionCounts.${type}`]: amount } }
    );
}

async incCommentReaction(commentId: string | Object, type: string, amount: number) {
    return commentModel.updateOne(
        { _id: commentId },
        { $inc: { [`reactionCounts.${type}`]: amount } }
    );
}
  async findPost(postId: mongoose.Types.ObjectId): Promise<IPost | null> {
    return await postModel.findById( postId );
  }
  async findComment(commentId: mongoose.Types.ObjectId): Promise<IComment|null> {
    return await commentModel.findById( commentId );
  }
  static getInstance() {
    if (!LikeRepo.instance) LikeRepo.instance = new LikeRepo();
    return LikeRepo.instance;
  }
}
