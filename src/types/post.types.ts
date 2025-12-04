import mongoose from "mongoose";
import { IUser } from "./user.types";
export enum PostType {
  public = "public",
  private = "private",
}
export interface IPost {
  _id?: string;
  caption?: string;
  authorID: mongoose.Types.ObjectId;
  type: string; //public or private
  mentions?: [{ id: mongoose.Types.ObjectId; username: string }];
  media?: [string];
  sharedFrom?: mongoose.Types.ObjectId;
  location: string; // Profile Or group
  groupID?: mongoose.Types.ObjectId;
  views?: number;
  flagged?: boolean;
  reactionCounts: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
}
export enum ToxicityFlags {
  safe = "safe",
  flagged = "flagged",
  blocked = "blocked",
}
export interface createPostDTO {
  caption?: string;
  authorID?: mongoose.Types.ObjectId;
  type?: string; //public or private
  mentions?: IUser[];
  media?: string[];
  sharedFrom?: mongoose.Types.ObjectId;
  location?: string; // Profile Or group
  groupID?: mongoose.Types.ObjectId;
  flagged?: boolean;
}

export interface updatePostDTO {
  updatedData: {
    caption?: string;
    type?: string;
    mentions?: IUser[] | null;
    flagged?: boolean;
  };
  userID: mongoose.Types.ObjectId;
  postID: mongoose.Types.ObjectId;
}
