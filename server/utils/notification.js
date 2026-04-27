import prisma from '../lib/prisma.js'

export const sendNotification = async ({ userId, type, message, entityId = null, io = null }) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        entityId,
      },
    })

    // Send to user's private room in real time
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', { notification })
    }

    return notification
  } catch (err) {
    console.error('Failed to send notification:', err)
  }
}