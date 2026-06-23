import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../../database/models/user.model";
import ChatService from "./chat.service";
import FirebaseService from "../../core/services/firebase.service";
import { EntityType } from "../../types/notification.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Personal room key for a user: used to target emits without storing socket IDs */
const userRoom = (userId: string) => `user:${userId}`;

// ─── Gateway Init ─────────────────────────────────────────────────────────────

export function initChatGateway(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  const chatService = ChatService.getInstance();

  // ── Authentication Middleware ─────────────────────────────────────────────
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Authentication token is missing."));

      const secret = process.env.JWT_SECRET;
      if (!secret) return next(new Error("Server configuration error."));

      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (!decoded?.id) return next(new Error("Invalid token payload."));

      const user = await userModel.findById(decoded.id);
      if (!user) return next(new Error("User not found."));

      // Attach user to socket for later use
      socket.data.userId = (user._id as unknown as { toString(): string }).toString();
      socket.data.username = user.username;

      next();
    } catch (err) {
      next(new Error("Unauthorized: invalid or expired token."));
    }
  });

  // ── Connection Handler ────────────────────────────────────────────────────
  io.on("connection", (socket: Socket) => {
    const userId: string = socket.data.userId;

    // Join personal room so we can emit to this user without tracking socket IDs
    socket.join(userRoom(userId));
    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    // ── Event: chat:send ────────────────────────────────────────────────────
    /**
     * Client sends:  { conversationId: string, content: string }
     * Server emits:  "chat:message" to both participants' rooms
     */
    socket.on(
      "chat:send",
      async (data: { conversationId: string; content: string }) => {
        try {
          const { conversationId, content } = data;

          if (!conversationId || !content?.trim()) {
            socket.emit("chat:error", { message: "conversationId and content are required." });
            return;
          }

          const { message, conversation } = await chatService.sendMessage(
            userId,
            conversationId,
            content.trim()
          );

          const messagePayload = {
            _id: message._id,
            conversationId,
            content: message.content,
            sender: message.sender,
            isRead: message.isRead,
            createdAt: (message as any).createdAt,
          };

          // Broadcast to both participants
          const participants: string[] = conversation.participants.map(
            (p: any) => (p._id ? p._id.toString() : p.toString())
          );

          participants.forEach((participantId) => {
            io.to(userRoom(participantId)).emit("chat:message", messagePayload);
          });

          // ── FCM fallback for offline recipients ─────────────────────────
          const recipientId = participants.find((id) => id !== userId);
          if (recipientId) {
            const recipientSockets = await io.in(userRoom(recipientId)).fetchSockets();
            if (recipientSockets.length === 0) {
              // Recipient is offline — send push notification
              FirebaseService.getInstance()
                .sendToUser(recipientId, {
                  title: socket.data.username ?? "New Message",
                  body: content.trim().slice(0, 100),
                  entityType: EntityType.MESSAGE,
                  entityId: conversationId,
                })
                .catch((err) =>
                  console.error("[FCM] Chat push notification failed:", err)
                );
            }
          }
        } catch (err: any) {
          console.error("[Socket] chat:send error:", err.message);
          socket.emit("chat:error", { message: err.message ?? "Failed to send message." });
        }
      }
    );

    // ── Event: chat:read ────────────────────────────────────────────────────
    /**
     * Client sends:  { conversationId: string }
     * Server emits:  "chat:read_ack" back to sender, "chat:read" to recipient
     */
    socket.on("chat:read", async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        await chatService.markAsRead(conversationId, userId);

        // Notify the other participant that their messages were seen
        const conversation = await chatService.getOrCreateConversation(userId, userId).catch(() => null);
        // Fetch conversation directly from service context
        socket.emit("chat:read_ack", { conversationId });

        // Notify the other side — we broadcast to the room excluding sender
        socket.to(userRoom(userId)).emit("chat:read", { conversationId, readBy: userId });
      } catch (err: any) {
        console.error("[Socket] chat:read error:", err.message);
      }
    });

    // ── Event: chat:typing ──────────────────────────────────────────────────
    /**
     * Client sends:  { conversationId: string, recipientId: string }
     * Server emits:  "chat:typing" to recipient's room only
     */
    socket.on(
      "chat:typing",
      (data: { conversationId: string; recipientId: string }) => {
        const { conversationId, recipientId } = data;
        if (!conversationId || !recipientId) return;

        io.to(userRoom(recipientId)).emit("chat:typing", {
          conversationId,
          senderId: userId,
        });
      }
    );

    // ── Event: chat:stop_typing ─────────────────────────────────────────────
    socket.on(
      "chat:stop_typing",
      (data: { conversationId: string; recipientId: string }) => {
        const { conversationId, recipientId } = data;
        if (!conversationId || !recipientId) return;

        io.to(userRoom(recipientId)).emit("chat:stop_typing", {
          conversationId,
          senderId: userId,
        });
      }
    );

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket] User ${userId} disconnected (${socket.id})`);
    });
  });

  console.log("[Socket.IO] Chat gateway initialized.");
  return io;
}
