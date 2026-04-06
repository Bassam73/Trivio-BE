import notificationModel from "../../database/models/notification.model";
import { createNotificationDTO } from "../../types/notification.types";

export default class NotificationRepository {
  public static instance: NotificationRepository;

  async createNotification(data: createNotificationDTO) {
    return await notificationModel.create(data);
  }

  async getUnreadNotifications(receiverId: string) {
    return await notificationModel
      .find({ receiver: receiverId, isRead: false })
      .sort({ createdAt: -1 })
      .populate("sender", "username avatar");
  }

  async markAsRead(notificationId: string) {
    return await notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  public static getInstnce() {
    if (!NotificationRepository.instance)
      NotificationRepository.instance = new NotificationRepository();
    return NotificationRepository.instance;
  }
}
