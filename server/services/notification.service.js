import prisma from '../lib/prisma.js'

export const getUserNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  })

  return { notifications, unreadCount }
}

export const markNotificationRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification) {
    throw { status: 404, message: 'Notification not found' }
  }

  if (notification.userId !== userId) {
    throw { status: 403, message: 'Not authorized' }
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
}

export const markAllNotificationsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}

export const deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification) {
    throw { status: 404, message: 'Notification not found' }
  }

  if (notification.userId !== userId) {
    throw { status: 403, message: 'Not authorized' }
  }

  return prisma.notification.delete({ where: { id: notificationId } })
}