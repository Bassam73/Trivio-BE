import notificationModel from "../../database/models/notification.model";
import INotification, {
  createNotificationDTO,
} from "../../types/notification.types";

export default class NotificationRepository {
  public static instance: NotificationRepository;

  async createNotification(data: createNotificationDTO) {
    return await notificationModel.create(data);
  }

  async getUnreadNotifications(receiverId: string) {
    return await notificationModel
      .find({ receiver: receiverId, isRead: false })
      .sort({ createdAt: -1 })
      .populate("sender", "username avatar")
      .populate("postId", "_id");
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
  }

  async deleteNotificationByEntityId(entityID: string): Promise<void> {
    await notificationModel.deleteMany({ entityID });
  }

  async deleteNotificationsByEntityIds(entityIDs: string[]): Promise<void> {
    await notificationModel.deleteMany({ entityID: { $in: entityIDs } });
  }

  async getNotificationByID(
    notficationID: string,
  ): Promise<INotification | null> {
    return await notificationModel.findById(notficationID);
  }

  public static getInstnce() {
    if (!NotificationRepository.instance)
      NotificationRepository.instance = new NotificationRepository();
    return NotificationRepository.instance;
  }
}
