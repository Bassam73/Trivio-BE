import mongoose, { Schema } from "mongoose";
import IConversation from "../../types/chat.types";

const schema: Schema<IConversation> = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "user" }],
      validate: {
        validator: (v: mongoose.Types.ObjectId[]) => v.length === 2,
        message: "A conversation must have exactly 2 participants.",
      },
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
      required: false,
    },
  },
  { timestamps: true }
);

/**
 * Unique compound index on sorted participants ensures only ONE conversation
 * exists per user pair, regardless of who initiates first.
 */
schema.index({ participants: 1 }, { unique: true });

const conversationModel = mongoose.model<IConversation>("conversation", schema);
export default conversationModel;
