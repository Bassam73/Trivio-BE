import mongoose from "mongoose";
import AppError from "../../core/utils/AppError";
import userModel from "../../database/models/user.model";
import messageModel from "../../database/models/message.model";
import ChatRepository from "./chat.repo";

export default class ChatService {
  private static instance: ChatService;
  private repo: ChatRepository;

  constructor(repo: ChatRepository) {
    this.repo = repo;
  }

  // ─── Conversations ─────────────────────────────────────────────────────────

  /**
   * Opens or retrieves a conversation between two users.
   * Validates that both users exist before touching the DB.
   */
  async getOrCreateConversation(requesterId: string, targetUserId: string) {
    if (requesterId === targetUserId) {
      throw new AppError("You cannot start a conversation with yourself.", 400);
    }

    const target = await userModel.findById(targetUserId);
    if (!target) throw new AppError("User not found.", 404);

    const { conversation } = await this.repo.findOrCreateConversation(
      requesterId,
      targetUserId
    );

    return conversation;
  }

  async getConversations(userId: string) {
    return this.repo.getConversations(userId);
  }

  // ─── Messages ──────────────────────────────────────────────────────────────

  /**
   * Creates a message. Validates the sender is a participant.
   * Updates lastMessage + updatedAt on the conversation.
   * Returns the saved message (populated sender).
   */
  async sendMessage(
    senderId: string,
    conversationId: string,
    content: string
  ) {
    const conversation = await this.repo.getConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found.", 404);

    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === senderId || p.toString() === senderId
    );
    if (!isParticipant) {
      throw new AppError("You are not a participant of this conversation.", 403);
    }

    const message = await this.repo.createMessage({
      conversation: new mongoose.Types.ObjectId(conversationId),
      sender: new mongoose.Types.ObjectId(senderId),
      content,
    });

    // Keep conversation "inbox" sorted by last activity
    await this.repo.updateLastMessage(conversationId, message._id as mongoose.Types.ObjectId);

    // Refetch with populated sender (IMessage doesn't expose .populate() directly)
    const populated = await messageModel
      .findById(message._id)
      .populate("sender", "username avatar");

    return { message: populated!, conversation };
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number,
    limit: number
  ) {
    const conversation = await this.repo.getConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found.", 404);

    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === userId || p.toString() === userId
    );
    if (!isParticipant) {
      throw new AppError("You are not a participant of this conversation.", 403);
    }

    return this.repo.getMessages(conversationId, page, limit);
  }

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.repo.getConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found.", 404);

    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === userId || p.toString() === userId
    );
    if (!isParticipant) {
      throw new AppError("You are not a participant of this conversation.", 403);
    }

    await this.repo.markMessagesAsRead(conversationId, userId);
  }

  async getUnreadCount(userId: string) {
    return this.repo.getUnreadCount(userId);
  }

  // ─── Singleton ─────────────────────────────────────────────────────────────

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService(ChatRepository.getInstance());
    }
    return ChatService.instance;
  }
}
