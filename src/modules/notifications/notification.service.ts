import AppError from "../../core/utils/AppError";
import INotification, {
  createNotificationDTO,
  EntityType,
} from "../../types/notification.types";
import NotificationRepository from "./notification.repo";
import FirebaseService from "../../core/services/firebase.service";
import { PushPayload } from "../../core/services/firebase.service";

export default class NotificationService {
  public static instance: NotificationService;
  public repo: NotificationRepository;
  constructor(repo: NotificationRepository) {
    this.repo = repo;
  }
  async createNotificaiton(data: createNotificationDTO) {
    const saved = await this.repo.createNotification(data);

    this.sendPush(saved).catch((err) =>
      console.error("[FCM] Push notification failed:", err),
    );

    return saved;
  }

  private async sendPush(notification: INotification): Promise<void> {
    const payload: PushPayload = {
      title: this.buildTitle(notification.entityType),
      body: notification.message,
      entityType: notification.entityType,
      entityId: notification.entityID.toString(),
      postId: notification.postId?.toString(),
      ...(notification.entityType === EntityType.FOLLOW
        ? { senderId: notification.sender.toString() }
        : {}),
    };
    await FirebaseService.getInstance().sendToUser(
      notification.receiver.toString(),
      payload,
    );
  }

  private buildTitle(entityType: EntityType): string {
    switch (entityType) {
      case EntityType.COMMENT:
        return "New Comment";
      case EntityType.REACT:
        return "New Reaction";
      case EntityType.FOLLOW:
        return "New Follower";
      case EntityType.POST:
        return "Post Update";
      default:
        return "Trivio";
    }
  }

  async getUnreadNotifications(userId: string) {
    return await this.repo.getUnreadNotifications(userId);
  }

  async markNotificationAsRead(notificationID: string, userID: string) {
    const notification: INotification | null =
      await this.repo.getNotificationByID(notificationID);
    if (!notification) throw new AppError("Notification not found", 404);
    if (notification.receiver.toString() != userID) {
      throw new AppError(
        "You are not authorized to access this notification",
        403,
      );
    }
    const updatedNotification = await this.repo.markAsRead(
      notification._id as unknown as string,
    );
    if (!updatedNotification || !updatedNotification.isRead) {
      throw new AppError("Error While updating the notification", 500);
    }
  }

  async deleteNotificationByEntityId(entityID: string): Promise<void> {
    await this.repo.deleteNotificationByEntityId(entityID);
  }

  async deleteNotificationsByEntityIds(entityIDs: string[]): Promise<void> {
    if (entityIDs.length > 0) {
      await this.repo.deleteNotificationsByEntityIds(entityIDs);
    }
  }
  public static getInstance() {
    if (!NotificationService.instance) {
      const repo = NotificationRepository.getInstnce();
      NotificationService.instance = new NotificationService(repo);
    }
    return NotificationService.instance;
  }
}
