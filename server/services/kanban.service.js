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

export const getProjectColumns = async (projectId) => {
  return prisma.column.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
    include: {
      cards: {
        orderBy: { order: 'asc' },
        include: cardWithAssignees,
      },
    },
  })
}

export const createColumn = async ({ name, projectId }) => {
  const lastColumn = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { order: 'desc' },
  })

  const order = lastColumn ? lastColumn.order + 1 : 0

  return prisma.column.create({
    data: { name: name.trim(), order, projectId },
    include: { cards: true },
  })
}

export const updateColumn = async (columnId, { name }) => {
  return prisma.column.update({
    where: { id: columnId },
    data: { name: name.trim() },
  })
}

export const deleteColumn = async (columnId) => {
  return prisma.column.delete({ where: { id: columnId } })
}

export const reorderColumns = async (columns) => {
  return prisma.$transaction(
    columns.map((col) =>
      prisma.column.update({
        where: { id: col.id },
        data: { order: col.order },
      })
    )
  )
}

export const createCard = async ({ title, description, dueDate, columnId }) => {
  const lastCard = await prisma.card.findFirst({
    where: { columnId },
    orderBy: { order: 'desc' },
  })

  const order = lastCard ? lastCard.order + 1 : 0

  return prisma.card.create({
    data: {
      title: title.trim(),
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      order,
      columnId,
    },
    include: cardWithAssignees,
  })
}

export const getCardById = async (cardId) => {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: cardWithAssignees,
  })

  if (!card) {
    throw { status: 404, message: 'Card not found' }
  }

  return card
}

export const updateCard = async (cardId, { title, description, dueDate }) => {
  return prisma.card.update({
    where: { id: cardId },
    data: {
      title: title.trim(),
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: cardWithAssignees,
  })
}

export const moveCard = async (cardId, { columnId, order }) => {
  return prisma.card.update({
    where: { id: cardId },
    data: { columnId, order },
    include: cardWithAssignees,
  })
}

export const deleteCard = async (cardId) => {
  return prisma.card.delete({ where: { id: cardId } })
}

export const reorderCards = async (cards) => {
  return prisma.$transaction(
    cards.map((card) =>
      prisma.card.update({
        where: { id: card.id },
        data: { order: card.order, columnId: card.columnId },
      })
    )
  )
}

export const assignCard = async (cardId, userId) => {
  const existing = await prisma.cardAssignee.findUnique({
    where: { cardId_userId: { cardId, userId } },
  })

  if (existing) {
    throw { status: 409, message: 'User already assigned to this card' }
  }

  return prisma.cardAssignee.create({
    data: { cardId, userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  })
}

export const unassignCard = async (cardId, userId) => {
  return prisma.cardAssignee.delete({
    where: { cardId_userId: { cardId, userId } },
  })
}