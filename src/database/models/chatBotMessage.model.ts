import mongoose, { Schema } from "mongoose";
import { IMessage } from "../../types/chatbotMessage.types";
const messageSchema: Schema<IMessage> = new Schema<IMessage>(
  {
    threadId: {
      type: String,
      required: true,
      index: true, 
    },
    senderType: {
      type: String,
      enum: ["human", "ai"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// messageSchema.index({ threadId: 1, createdAt: 1 });

const messageModel = mongoose.model<IMessage>("message", messageSchema);

export default messageModel;