import mongoose from "mongoose";

export interface ISavedPost extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}
