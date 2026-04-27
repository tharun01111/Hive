import prisma from '../lib/prisma.js'
import { logActivity } from '../utils/activity.js'
import { sendNotification } from '../utils/notification.js'

const cardWithAssignees = {
  assignees: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
}

const getProjectWorkspaceId = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true, name: true },
  })
  return project
}

export const registerKanbanHandlers = (io, socket) => {

  socket.on('card:move', async (data) => {
    const { cardId, columnId, order, projectId } = data
    if (!cardId || !columnId || order === undefined || !projectId) return

    try {
      const card = await prisma.card.update({
        where: { id: cardId },
        data: { columnId, order },
        include: cardWithAssignees,
      })

      io.to(`project:${projectId}`).emit('card:moved', { card, projectId })

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'CARD_MOVED',
        entity: 'card',
        entityId: cardId,
        meta: { title: card.title, columnId },
        io,
      })
    } catch (err) {
      console.error('Socket card:move error:', err)
      socket.emit('error', { message: 'Failed to move card' })
    }
  })

  socket.on('card:create', async (data) => {
    const { columnId, title, description, dueDate, projectId } = data
    if (!columnId || !title || !projectId) return

    try {
      const lastCard = await prisma.card.findFirst({
        where: { columnId },
        orderBy: { order: 'desc' },
      })

      const order = lastCard ? lastCard.order + 1 : 0

      const card = await prisma.card.create({
        data: {
          title: title.trim(),
          description: description?.trim(),
          dueDate: dueDate ? new Date(dueDate) : null,
          order,
          columnId,
        },
        include: cardWithAssignees,
      })

      io.to(`project:${projectId}`).emit('card:created', { card, projectId })

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'CARD_CREATED',
        entity: 'card',
        entityId: card.id,
        meta: { title: card.title },
        io,
      })
    } catch (err) {
      console.error('Socket card:create error:', err)
      socket.emit('error', { message: 'Failed to create card' })
    }
  })

  socket.on('card:update', async (data) => {
    const { cardId, title, description, dueDate, projectId } = data
    if (!cardId || !title || !projectId) return

    try {
      const card = await prisma.card.update({
        where: { id: cardId },
        data: {
          title: title.trim(),
          description: description?.trim(),
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: cardWithAssignees,
      })

      io.to(`project:${projectId}`).emit('card:updated', { card, projectId })

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'CARD_UPDATED',
        entity: 'card',
        entityId: cardId,
        meta: { title: card.title },
        io,
      })
    } catch (err) {
      console.error('Socket card:update error:', err)
      socket.emit('error', { message: 'Failed to update card' })
    }
  })

  socket.on('card:delete', async (data) => {
    const { cardId, projectId } = data
    if (!cardId || !projectId) return

    try {
      const card = await prisma.card.findUnique({ where: { id: cardId } })
      await prisma.card.delete({ where: { id: cardId } })

      io.to(`project:${projectId}`).emit('card:deleted', { cardId, projectId })

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'CARD_DELETED',
        entity: 'card',
        entityId: cardId,
        meta: { title: card?.title },
        io,
      })
    } catch (err) {
      console.error('Socket card:delete error:', err)
      socket.emit('error', { message: 'Failed to delete card' })
    }
  })

  socket.on('card:assign', async (data) => {
    const { cardId, userId, projectId } = data
    if (!cardId || !userId || !projectId) return

    console.log("Card assigned to: ", cardId, userId, projectId);

    try {
      const existing = await prisma.cardAssignee.findUnique({
        where: { cardId_userId: { cardId, userId } },
      })

      if (existing) return

      await prisma.cardAssignee.create({
        data: { cardId, userId },
      })

      const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: cardWithAssignees,
      })

      io.to(`project:${projectId}`).emit('card:assigned', { card, projectId })

      // Notify the assigned user — only if they didn't assign themselves
      if (userId !== socket.userId) {
        const assigner = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: { name: true },
        })

        await sendNotification({
          userId,
          type: 'CARD_ASSIGNED',
          message: `${assigner.name} assigned you to "${card.title}"`,
          entityId: cardId,
          io,
        })
      }

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'CARD_ASSIGNED',
        entity: 'card',
        entityId: cardId,
        meta: { title: card.title, assignedUserId: userId },
        io,
      })
    } catch (err) {
      console.error('Socket card:assign error:', err)
      socket.emit('error', { message: 'Failed to assign card' })
    }
  })

  socket.on('card:unassign', async (data) => {
    const { cardId, userId, projectId } = data
    if (!cardId || !userId || !projectId) return

    try {
      await prisma.cardAssignee.delete({
        where: { cardId_userId: { cardId, userId } },
      })

      const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: cardWithAssignees,
      })

      io.to(`project:${projectId}`).emit('card:unassigned', { card, projectId })
    } catch (err) {
      console.error('Socket card:unassign error:', err)
      socket.emit('error', { message: 'Failed to unassign card' })
    }
  })

  socket.on('column:create', async (data) => {
    const { name, projectId } = data
    if (!name || !projectId) return

    try {
      const lastColumn = await prisma.column.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' },
      })

      const order = lastColumn ? lastColumn.order + 1 : 0

      const column = await prisma.column.create({
        data: { name: name.trim(), order, projectId },
        include: { cards: true },
      })

      io.to(`project:${projectId}`).emit('column:created', { column, projectId })

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'COLUMN_CREATED',
        entity: 'column',
        entityId: column.id,
        meta: { name: column.name },
        io,
      })
    } catch (err) {
      console.error('Socket column:create error:', err)
      socket.emit('error', { message: 'Failed to create column' })
    }
  })

  socket.on('column:update', async (data) => {
    const { columnId, name, projectId } = data
    if (!columnId || !name || !projectId) return

    try {
      const column = await prisma.column.update({
        where: { id: columnId },
        data: { name: name.trim() },
      })

      io.to(`project:${projectId}`).emit('column:updated', { column, projectId })

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'COLUMN_UPDATED',
        entity: 'column',
        entityId: columnId,
        meta: { name: column.name },
        io,
      })
    } catch (err) {
      console.error('Socket column:update error:', err)
      socket.emit('error', { message: 'Failed to update column' })
    }
  })

  socket.on('column:delete', async (data) => {
    const { columnId, projectId } = data
    if (!columnId || !projectId) return

    try {
      const column = await prisma.column.findUnique({ where: { id: columnId } })
      await prisma.column.delete({ where: { id: columnId } })

      io.to(`project:${projectId}`).emit('column:deleted', { columnId, projectId })

      const project = await getProjectWorkspaceId(projectId)
      await logActivity({
        workspaceId: project.workspaceId,
        projectId,
        userId: socket.userId,
        type: 'COLUMN_DELETED',
        entity: 'column',
        entityId: columnId,
        meta: { name: column?.name },
        io,
      })
    } catch (err) {
      console.error('Socket column:delete error:', err)
      socket.emit('error', { message: 'Failed to delete column' })
    }
  })

  socket.on('columns:reorder', async (data) => {
    const { columns, projectId } = data
    if (!Array.isArray(columns) || !projectId) return

    try {
      await prisma.$transaction(
        columns.map((col) =>
          prisma.column.update({
            where: { id: col.id },
            data: { order: col.order },
          })
        )
      )

      io.to(`project:${projectId}`).emit('columns:reordered', { columns, projectId })
    } catch (err) {
      console.error('Socket columns:reorder error:', err)
      socket.emit('error', { message: 'Failed to reorder columns' })
    }
  })
}