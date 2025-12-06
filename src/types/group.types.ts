import mongoose from "mongoose";
export enum GroupPrivacy {
  public = "public",
  private = "private",
}
export enum GroupRole {
  admin = "admin",
  moderator = "moderator",
  member = "member",
}
export enum GroupStatus {
  active = "active",
  banned = "banned",
}
export enum JoinStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected",
}
export interface IGroup extends Document {
  name: string;
  description: string;
  logo?: string;
  members: number;
  admins: number;
  privacy: GroupPrivacy;
  creatorId: mongoose.Types.ObjectId;
  tags?: string[];
}

export interface IGroupMember {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: GroupRole;
  status: GroupStatus;
}

export interface IJoinRequest {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: JoinStatus;
}

export interface createGroupDTO {
  name: string;
  description: string;
  privacy: GroupPrivacy;
  logo?: string;
  tags?: string[];
  creatorId: string;
}

export interface updateGroupDTO {
  data: {
    name?: string;
    description?: string;
    privacy?: GroupPrivacy;
    logo?: string;
    tags?: string[];
  };
  postId: string;
  userID: string;
}
