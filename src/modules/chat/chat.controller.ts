import { Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import AppError from "../../core/utils/AppError";
import ChatService from "./chat.service";

const service = ChatService.getInstance();

/**
 * GET /api/v1/chat/conversations
 * Returns all conversations for the logged-in user, sorted by most recent.
 */
export const getConversations = catchError(
  async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    if (!userId) throw new AppError("User not authenticated.", 401);

    const conversations = await service.getConversations(userId.toString());

    res.status(200).json({
      status: "success",
      results: conversations.length,
      data: { conversations },
    });
  }
);

/**
 * POST /api/v1/chat/conversations/:userId
 * Opens or retrieves a 1-to-1 conversation with the given user.
 * First call creates the conversation; subsequent calls return the existing one.
 */
export const getOrCreateConversation = catchError(
  async (req: Request, res: Response) => {
    const requesterId = req.user?._id as string;
    if (!requesterId) throw new AppError("User not authenticated.", 401);

    const { userId: targetUserId } = req.params;

    const conversation = await service.getOrCreateConversation(
      requesterId.toString(),
      targetUserId
    );

    res.status(200).json({
      status: "success",
      data: { conversation },
    });
  }
);

/**
 * GET /api/v1/chat/conversations/:id/messages?page=1&limit=20
 * Returns paginated message history (oldest→newest).
 */
export const getMessages = catchError(
  async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    if (!userId) throw new AppError("User not authenticated.", 401);

    const { id: conversationId } = req.params;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const messages = await service.getMessages(
      conversationId,
      userId.toString(),
      page,
      limit
    );

    res.status(200).json({
      status: "success",
      results: messages.length,
      page,
      data: { messages },
    });
  }
);

/**
 * PATCH /api/v1/chat/conversations/:id/read
 * Marks all unread messages in a conversation as read.
 */
export const markAsRead = catchError(
  async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    if (!userId) throw new AppError("User not authenticated.", 401);

    const { id: conversationId } = req.params;

    await service.markAsRead(conversationId, userId.toString());

    res.status(200).json({ status: "success" });
  }
);

/**
 * GET /api/v1/chat/unread-count
 * Returns total unread message count across all conversations.
 */
export const getUnreadCount = catchError(
  async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    if (!userId) throw new AppError("User not authenticated.", 401);

    const count = await service.getUnreadCount(userId.toString());

    res.status(200).json({
      status: "success",
      data: { unreadCount: count },
    });
  }
);
