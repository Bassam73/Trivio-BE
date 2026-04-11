import mongoose from "mongoose";
import { IUser } from "./user.types";
export enum PostType {
  public = "public",
  private = "private",
}
export enum MediaType {
  image = "image",
  reel = "reel",
}

export interface IMediaItem {
  url: string;
  mediaType: MediaType;
}

export interface IReel {
  url: string;
  mediaType: MediaType;
  author: IUser;
}

export interface IPost {
  _id?: string;
  caption?: string;
  authorID: mongoose.Types.ObjectId;
  type: string; //public or private
  mentions?: [{ id: mongoose.Types.ObjectId; username: string }];
  media?: IMediaItem[];
  sharedFrom?: mongoose.Types.ObjectId;
  location: string; // Profile Or group
  groupID?: mongoose.Types.ObjectId;
  views?: number;
  flagged?: boolean;
  tags?: [string];
  shownTags?: boolean;
  commentsCount: number;
  sharesCount?: number;
  tags_id?: [number];
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
  media?: IMediaItem[];
  sharedFrom?: mongoose.Types.ObjectId;
  location?: string; // Profile Or group
  groupID?: mongoose.Types.ObjectId;
  tags_id?: [number];
  flagged?: boolean;
  shownTags?: boolean;
}

export interface updatePostDTO {
  updatedData: {
    caption?: string;
    type?: string;
    mentions?: IUser[] | null;
    flagged?: boolean;
    tags_id?: [number];
  };
  userID: mongoose.Types.ObjectId;
  postID: mongoose.Types.ObjectId;
}
