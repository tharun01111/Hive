import prisma from '../lib/prisma.js'

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, read: false },
    })

    return res.status(200).json({ notifications, unreadCount })
  } catch (err) {
    console.error('Get notifications error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const markAsRead = async (req, res) => {
  const { notificationId } = req.params

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    return res.status(200).json({ notification: updated })
  } catch (err) {
    console.error('Mark as read error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    })

    return res.status(200).json({ message: 'All notifications marked as read' })
  } catch (err) {
    console.error('Mark all as read error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.notification.delete({ where: { id: notificationId } })

    return res.status(200).json({ message: 'Notification deleted' })
  } catch (err) {
    console.error('Delete notification error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}