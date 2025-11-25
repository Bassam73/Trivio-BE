import mongoose from "mongoose";

export interface IMember {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: string;
}
