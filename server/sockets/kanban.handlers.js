import prisma from '../lib/prisma.js'

const cardWithAssignees = {
  assignees: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
}

export const registerKanbanHandlers = (io, socket) => {

  // Card moved between columns or reordered
  socket.on('card:move', async (data) => {
    const { cardId, columnId, order, projectId } = data

    if (!cardId || !columnId || order === undefined || !projectId) return

    try {
      const card = await prisma.card.update({
        where: { id: cardId },
        data: { columnId, order },
        include: cardWithAssignees,
      })

      // Broadcast to everyone in the room including sender
      io.to(`project:${projectId}`).emit('card:moved', { card, projectId })
    } catch (err) {
      console.error('Socket card:move error:', err)
      socket.emit('error', { message: 'Failed to move card' })
    }
  })

  // New card created
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
    } catch (err) {
      console.error('Socket card:create error:', err)
      socket.emit('error', { message: 'Failed to create card' })
    }
  })

  // Card updated
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
    } catch (err) {
      console.error('Socket card:update error:', err)
      socket.emit('error', { message: 'Failed to update card' })
    }
  })

  // Card deleted
  socket.on('card:delete', async (data) => {
    const { cardId, projectId } = data

    if (!cardId || !projectId) return

    try {
      await prisma.card.delete({ where: { id: cardId } })
      io.to(`project:${projectId}`).emit('card:deleted', { cardId, projectId })
    } catch (err) {
      console.error('Socket card:delete error:', err)
      socket.emit('error', { message: 'Failed to delete card' })
    }
  })

  // Column created
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
    } catch (err) {
      console.error('Socket column:create error:', err)
      socket.emit('error', { message: 'Failed to create column' })
    }
  })

  // Column updated
  socket.on('column:update', async (data) => {
    const { columnId, name, projectId } = data

    if (!columnId || !name || !projectId) return

    try {
      const column = await prisma.column.update({
        where: { id: columnId },
        data: { name: name.trim() },
      })

      io.to(`project:${projectId}`).emit('column:updated', { column, projectId })
    } catch (err) {
      console.error('Socket column:update error:', err)
      socket.emit('error', { message: 'Failed to update column' })
    }
  })

  // Column deleted
  socket.on('column:delete', async (data) => {
    const { columnId, projectId } = data

    if (!columnId || !projectId) return

    try {
      await prisma.column.delete({ where: { id: columnId } })
      io.to(`project:${projectId}`).emit('column:deleted', { columnId, projectId })
    } catch (err) {
      console.error('Socket column:delete error:', err)
      socket.emit('error', { message: 'Failed to delete column' })
    }
  })

  // Columns reordered
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