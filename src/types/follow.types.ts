import mongoose from "mongoose";

export interface IFollow {
  userId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
}
