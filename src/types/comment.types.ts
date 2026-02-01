import mongoose from "mongoose";

export interface IComment {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  media?: string;
  text?: string;
  isDeleted: boolean;
  isEdited: boolean;
}
