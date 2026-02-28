import mongoose from "mongoose";

export enum ReactionType {
  LIKE = "like",
  LOVE = "love",
  HAHA = "haha",
  WOW = "wow",
  SAD = "sad",
  ANGRY = "angry",
  GOAL = "goal",
  OFFSIDE = "offside",
}

export interface IReaction {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  onModel: "post" | "comment";
  reaction: ReactionType;
  createdAt?: string;
  updatedAt?: string;
}

export interface createReactionDTO {
  userId: string;
  modelId: string;
  onModel: "post" | "comment";
  reaction: ReactionType;
}

export interface updateReactionDTO {
  reactionId: string;
  userId: string;
  reaction: ReactionType;
}
