import mongoose from "mongoose";

export enum EntityType {
  REACT = "REACT",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
  POST = "POST",
}
export default interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message: string;
  entityID: mongoose.Types.ObjectId;
  entityType: EntityType;
  isRead?: boolean;
  postId?: mongoose.Types.ObjectId; // the post this notification relates to (not set for FOLLOW)
}

export interface createNotificationDTO {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message?: string;
  entityID: mongoose.Types.ObjectId;
  entityType?: EntityType;
  isRead?: boolean;
  postId?: mongoose.Types.ObjectId; // optional – not relevant for FOLLOW notifications
}
