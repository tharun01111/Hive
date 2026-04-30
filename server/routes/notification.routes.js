import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationController,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { notificationSchemas } from "../validation/schemas.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch(
  "/:notificationId/read",
  validate(notificationSchemas.notificationId),
  markAsRead,
);
router.delete(
  "/:notificationId",
  validate(notificationSchemas.notificationId),
  deleteNotificationController,
);

export default router;
