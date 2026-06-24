import mongoose, { Schema } from "mongoose";
import { IMessage } from "../../types/chat.types";

const schema: Schema<IMessage> = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/** Efficient history fetch: conversation + newest-first */
schema.index({ conversation: 1, createdAt: -1 });

const messageModel = mongoose.model<IMessage>("chatMessage", schema);
export default messageModel;
