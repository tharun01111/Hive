import { Router } from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationController,
} from '../controllers/notification.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getNotifications)
router.patch('/read-all', markAllAsRead)
router.patch('/:notificationId/read', markAsRead)
router.delete('/:notificationId', deleteNotificationController)

export default router