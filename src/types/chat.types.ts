import mongoose from "mongoose";

// ─── Conversation ────────────────────────────────────────────────────────────

export default interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  /** Always exactly two participants */
  participants: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  /** Sorted participant IDs joined by "_" — used as the unique dedup key */
  conversationKey: string;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateMessageDTO {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
}
