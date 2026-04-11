import admin from "../../config/firebase";
import UsersRepository from "../../modules/users/users.repo";
import { EntityType } from "../../types/notification.types";

export interface PushPayload {
  title: string;
  body: string;
  entityType: EntityType;
  entityId: string;
  postId?: string;
  senderId?: string; // populated for FOLLOW notifications
}

export default class FirebaseService {
  private static instance: FirebaseService;

  async sendToUser(receiverId: string, payload: PushPayload): Promise<void> {
    const tokens = await UsersRepository.getInstance().getFcmTokens(receiverId);

    if (!tokens.length) return; 

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        entityType: payload.entityType,
        entityId: payload.entityId,
        ...(payload.postId   ? { postId:   payload.postId   } : {}),
        ...(payload.senderId ? { senderId: payload.senderId } : {}),
      },
      android: {
        priority: "high",
        notification: { sound: "default" },
      },
      apns: {
        payload: { aps: { sound: "default" } },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    const staleTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          staleTokens.push(tokens[idx]);
        }
        console.warn(
          `[FCM] Failed to send to token ${tokens[idx]}: ${resp.error?.message}`,
        );
      }
    });

    if (staleTokens.length) {
      await Promise.all(
        staleTokens.map((token) =>
          UsersRepository.getInstance().removeFcmToken(receiverId, token),
        ),
      );
      console.log(
        `[FCM] Removed ${staleTokens.length} stale token(s) for user ${receiverId}`,
      );
    }
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }
}
