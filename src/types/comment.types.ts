import mongoose from "mongoose";

export interface IComment {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  text: string;
  isEdited: boolean;
  repliesCount: number;
  reactionsCount: number;
  flagged: boolean;
}

export interface createCommentDTO {
  userId: string;
  postId: string;
  text: string;
}

export interface updateCommentDTO {
  cid: string;
  userId: string;
  text: string;
}

export interface createReplyDTO {
  userId: string;
  postId: string;
  parent: string;
  text: string;
}
