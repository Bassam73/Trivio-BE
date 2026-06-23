import { Router } from "express";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  markAsRead,
  getUnreadCount,
} from "./chat.controller";

const chatRouter = Router();

// All chat routes are protected
chatRouter.use(protectedRoutes);

/**
 * GET  /api/v1/chat/conversations
 *      → inbox list sorted by most recent activity
 *
 * POST /api/v1/chat/conversations/:userId
 *      → open or retrieve a 1-to-1 conversation with :userId
 *
 * GET  /api/v1/chat/conversations/:id/messages?page=1&limit=20
 *      → paginated message history
 *
 * PATCH /api/v1/chat/conversations/:id/read
 *      → mark all messages in conversation as read
 *
 * GET  /api/v1/chat/unread-count
 *      → total unread message count across all conversations
 */
chatRouter.get("/conversations", getConversations);
chatRouter.post("/conversations/:userId", getOrCreateConversation);
chatRouter.get("/conversations/:id/messages", getMessages);
chatRouter.patch("/conversations/:id/read", markAsRead);
chatRouter.get("/unread-count", getUnreadCount);

export default chatRouter;
