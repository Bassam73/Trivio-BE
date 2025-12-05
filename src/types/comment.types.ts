import mongoose from "mongoose";

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  media?: string;
  text?: string;
  reactionCounts: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
}
