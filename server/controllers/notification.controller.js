import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../services/notification.service.js";
import { handle } from "../utils/controllerHandler.js";

export const getNotifications = handle(async (req, res) => {
  const result = await getUserNotifications(req.userId);
  return res.status(200).json(result);
});

export const markAsRead = handle(async (req, res) => {
  const notification = await markNotificationRead(
    req.params.notificationId,
    req.userId,
  );
  return res.status(200).json({ notification });
});

export const markAllAsRead = handle(async (req, res) => {
  await markAllNotificationsRead(req.userId);
  return res.status(200).json({ message: "All notifications marked as read" });
});

export const deleteNotificationController = handle(async (req, res) => {
  await deleteNotification(req.params.notificationId, req.userId);
  return res.status(200).json({ message: "Notification deleted" });
});
