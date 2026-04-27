import { Router } from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getNotifications)
router.patch('/read-all', markAllAsRead)
router.patch('/:notificationId/read', markAsRead)
router.delete('/:notificationId', deleteNotification)

export default router