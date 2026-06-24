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
    /**
     * Deterministic unique key: sorted participant IDs joined by "_".
     * e.g. "aaa111_bbb222" — always the same regardless of who initiates.
     * This is the correct way to enforce one conversation per pair in MongoDB,
     * because a unique index on an array field is a multikey index and would
     * incorrectly prevent any user from appearing in more than one conversation.
     */
    conversationKey: {
      type: String,
      required: true,
      unique: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "chatMessage",
      required: false,
    },
  },
  { timestamps: true }
);

const conversationModel = mongoose.model<IConversation>("conversation", schema);
export default conversationModel;
