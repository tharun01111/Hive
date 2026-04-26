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

export const createCard = async (req, res) => {
  const { columnId } = req.params
  const { title, description, dueDate } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Card title is required' })
  }

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

    return res.status(201).json({ card })
  } catch (err) {
    console.error('Create card error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getCard = async (req, res) => {
  const { cardId } = req.params

  try {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: cardWithAssignees,
    })

    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    return res.status(200).json({ card })
  } catch (err) {
    console.error('Get card error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateCard = async (req, res) => {
  const { cardId } = req.params
  const { title, description, dueDate } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Card title is required' })
  }

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

    return res.status(200).json({ card })
  } catch (err) {
    console.error('Update card error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteCard = async (req, res) => {
  const { cardId } = req.params

  try {
    await prisma.card.delete({ where: { id: cardId } })
    return res.status(200).json({ message: 'Card deleted successfully' })
  } catch (err) {
    console.error('Delete card error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const moveCard = async (req, res) => {
  const { cardId } = req.params
  const { columnId, order } = req.body

  if (!columnId || order === undefined) {
    return res.status(400).json({ error: 'columnId and order are required' })
  }

  try {
    const card = await prisma.card.update({
      where: { id: cardId },
      data: { columnId, order },
      include: cardWithAssignees,
    })

    return res.status(200).json({ card })
  } catch (err) {
    console.error('Move card error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const reorderCards = async (req, res) => {
  const { cards } = req.body

  // cards = [{ id, order, columnId }, ...]
  if (!Array.isArray(cards)) {
    return res.status(400).json({ error: 'cards must be an array' })
  }

  try {
    await prisma.$transaction(
      cards.map((card) =>
        prisma.card.update({
          where: { id: card.id },
          data: { order: card.order, columnId: card.columnId },
        })
      )
    )

    return res.status(200).json({ message: 'Cards reordered' })
  } catch (err) {
    console.error('Reorder cards error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const assignCard = async (req, res) => {
  const { cardId } = req.params
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const existing = await prisma.cardAssignee.findUnique({
      where: { cardId_userId: { cardId, userId } },
    })

    if (existing) {
      return res.status(409).json({ error: 'User already assigned to this card' })
    }

    const assignee = await prisma.cardAssignee.create({
      data: { cardId, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    return res.status(201).json({ assignee })
  } catch (err) {
    console.error('Assign card error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const unassignCard = async (req, res) => {
  const { cardId, userId } = req.params

  try {
    await prisma.cardAssignee.delete({
      where: { cardId_userId: { cardId, userId } },
    })

    return res.status(200).json({ message: 'Assignee removed successfully' })
  } catch (err) {
    console.error('Unassign card error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}