import mongoose from "mongoose";
export enum FollowStauts {
  following = "following",
  pending = "pedning",
}
export interface IFollow extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  follwerId: mongoose.Types.ObjectId;
  status: FollowStauts;
}
