import prisma from '../lib/prisma.js'

export const registerChatHandlers = (io, socket) => {

  socket.on('message:send', async (data) => {
    const { projectId, content } = data

    if (!projectId || !content?.trim()) return

    try {
      const message = await prisma.message.create({
        data: {
          content: content.trim(),
          projectId,
          userId: socket.userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      })

      io.to(`project:${projectId}`).emit('message:received', { message })
    } catch (err) {
      console.error('Socket message:send error:', err)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  socket.on('typing:start', (data) => {
    const { projectId, userName } = data

    if (!projectId || !userName) return

    socket.to(`project:${projectId}`).emit('typing:started', {
      userId: socket.userId,
      userName,
      projectId,
    })
  })

  socket.on('typing:stop', (data) => {
    const { projectId } = data

    if (!projectId) return

    socket.to(`project:${projectId}`).emit('typing:stopped', {
      userId: socket.userId,
      projectId,
    })
  })

  socket.on('message:delete', async (data) => {
    const { messageId, projectId } = data

    if (!messageId || !projectId) return

    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      })

      if (!message) return

      if (message.userId !== socket.userId) {
        socket.emit('error', { message: 'You can only delete your own messages' })
        return
      }

      await prisma.message.delete({ where: { id: messageId } })

      io.to(`project:${projectId}`).emit('message:deleted', {
        messageId,
        projectId,
      })
    } catch (err) {
      console.error('Socket message:delete error:', err)
      socket.emit('error', { message: 'Failed to delete message' })
    }
  })
}