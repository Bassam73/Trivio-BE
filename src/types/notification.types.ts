import mongoose from "mongoose";

export enum EntityType {
  REACT = "REACT",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
  POST = "POST",
}
export default interface INotification extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message: string;
  entityID: mongoose.Types.ObjectId;
  entityType: EntityType;
  isRead?: boolean;
}

export interface createNotificationDTO {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message?: string;
  entityID: mongoose.Types.ObjectId;
  entityType?: EntityType;
  isRead?: boolean;
}
