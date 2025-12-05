import mongoose from "mongoose";

export interface IPost {
  _id?: mongoose.Types.ObjectId;
  caption: string;
  authorID: mongoose.Types.ObjectId;
  type: string; //public or private
  mentions?: [mongoose.Types.ObjectId];
  media?: [string];
  sharedFrom?: mongoose.Types.ObjectId;
  location: string; // Profile Or group
  groupID?: mongoose.Types.ObjectId;
  views?: number;
  reactionCounts: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
}
