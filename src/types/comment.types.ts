import mongoose from "mongoose";

export interface IComment {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  text: string;
  isEdited: boolean;
  repliesCount: number;
  reactionsCount: number;
}
