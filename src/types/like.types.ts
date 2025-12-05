import mongoose from "mongoose";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ILike {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
  react_type: ReactionType;
}