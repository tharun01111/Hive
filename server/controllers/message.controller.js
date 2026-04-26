import prisma from '../lib/prisma.js'

const messageWithUser = {
  user: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
}

export const getMessages = async (req, res) => {
  const { projectId } = req.params
  const { cursor, limit = 50 } = req.query

  try {
    const messages = await prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: messageWithUser,
    })

    const nextCursor = messages.length === Number(limit)
      ? messages[messages.length - 1].id
      : null

    // Reverse so oldest is first on the client
    return res.status(200).json({
      messages: messages.reverse(),
      nextCursor,
    })
  } catch (err) {
    console.error('Get messages error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const createMessage = async (req, res) => {
  const { projectId } = req.params
  const { content } = req.body

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Message content is required' })
  }

  try {
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        projectId,
        userId: req.userId,
      },
      include: messageWithUser,
    })

    return res.status(201).json({ message })
  } catch (err) {
    console.error('Create message error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    if (message.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' })
    }

    await prisma.message.delete({ where: { id: messageId } })

    return res.status(200).json({ message: 'Message deleted successfully' })
  } catch (err) {
    console.error('Delete message error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}