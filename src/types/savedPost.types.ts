import mongoose from "mongoose";

export interface ISavedPost {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}
