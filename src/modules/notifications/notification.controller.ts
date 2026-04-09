import { Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import NotificationService from "./notification.service";
import AppError from "../../core/utils/AppError";

const service = NotificationService.getInstance();

export const getNotifications = catchError(
  async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    if (!userId) throw new AppError("User not authenticated", 401);

    const notifications = await service.getUnreadNotifications(
      userId.toString(),
    );

    res.status(200).json({
      status: "success",
      results: notifications.length,
      data: { notifications },
    });
  },
);

export const markNotificationAsRead = catchError(
  async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    const notificationID = req.params.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    await service.markNotificationAsRead(notificationID, userId.toString());

    res.status(200).json({
      status: "success",
    });
  },
);
