import { ref } from "process";
import INotification, { EntityType } from "../../types/notification.types";
import mongoose, { Schema } from "mongoose";
import { boolean, string } from "joi";

const schema: Schema<INotification> = new Schema<INotification>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      enum: Object.values(EntityType),
      required: true,
    },
    entityID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model("notification", schema);
export default notificationModel;
