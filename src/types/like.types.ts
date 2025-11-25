import mongoose from "mongoose";

export interface ILike {
  user: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
  react_type: string;
}
