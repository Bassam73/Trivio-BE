import mongoose from "mongoose";
import conversationModel from "../../database/models/conversation.model";
import messageModel from "../../database/models/message.model";
import { CreateMessageDTO, IMessage } from "../../types/chat.types";

export default class ChatRepository {
  private static instance: ChatRepository;

  // ─── Conversations ─────────────────────────────────────────────────────────

  /**
   * Finds an existing 1-to-1 conversation between two users, or creates one.
   * Participants are sorted before the query to guarantee the unique index fires.
   */
  async findOrCreateConversation(
    userAId: string,
    userBId: string
  ) {
    // Sort to match unique index
    const sorted = [
      new mongoose.Types.ObjectId(userAId),
      new mongoose.Types.ObjectId(userBId),
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    const existing = await conversationModel.findOne({
      participants: { $all: sorted },
    });

    if (existing) return { conversation: existing, created: false };

    const conversation = await conversationModel.create({
      participants: sorted,
    });

    return { conversation, created: true };
  }

  async getConversationById(conversationId: string) {
    return conversationModel
      .findById(conversationId)
      .populate("participants", "username avatar")
      .populate({
        path: "lastMessage",
        select: "content sender createdAt isRead",
        populate: { path: "sender", select: "username avatar" },
      });
  }

  /**
   * Returns all conversations for a user, sorted by most recent activity.
   */
  async getConversations(userId: string) {
    return conversationModel
      .find({ participants: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .populate("participants", "username avatar")
      .populate({
        path: "lastMessage",
        select: "content sender createdAt isRead",
        populate: { path: "sender", select: "username avatar" },
      });
  }

  async updateLastMessage(
    conversationId: string,
    messageId: mongoose.Types.ObjectId
  ) {
    return conversationModel.findByIdAndUpdate(
      conversationId,
      { lastMessage: messageId, updatedAt: new Date() },
      { new: true }
    );
  }

  // ─── Messages ──────────────────────────────────────────────────────────────

  async createMessage(data: CreateMessageDTO): Promise<IMessage> {
    return messageModel.create(data);
  }

  /**
   * Paginated history, oldest→newest order (ascending).
   * Default: page=1, limit=20.
   */
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    return messageModel
      .find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatar");
  }

  /**
   * Marks all unread messages in a conversation as read,
   * excluding messages sent by the reader themselves.
   */
  async markMessagesAsRead(
    conversationId: string,
    readerId: string
  ): Promise<void> {
    await messageModel.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: new mongoose.Types.ObjectId(readerId) },
        isRead: false,
      },
      { isRead: true }
    );
  }

  /**
   * Total count of unread messages across all of a user's conversations.
   */
  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await conversationModel.find({
      participants: new mongoose.Types.ObjectId(userId),
    });
    const ids = conversations.map((c) => c._id);
    return messageModel.countDocuments({
      conversation: { $in: ids },
      sender: { $ne: new mongoose.Types.ObjectId(userId) },
      isRead: false,
    });
  }

  public static getInstance(): ChatRepository {
    if (!ChatRepository.instance) {
      ChatRepository.instance = new ChatRepository();
    }
    return ChatRepository.instance;
  }
}
