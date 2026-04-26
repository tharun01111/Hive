import prisma from '../lib/prisma.js'

export const createColumn = async (req, res) => {
  const { projectId } = req.params
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Column name is required' })
  }

  try {
    const lastColumn = await prisma.column.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    })

    const order = lastColumn ? lastColumn.order + 1 : 0

    const column = await prisma.column.create({
      data: {
        name: name.trim(),
        order,
        projectId,
      },
      include: { cards: true },
    })

    return res.status(201).json({ column })
  } catch (err) {
    console.error('Create column error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getColumns = async (req, res) => {
  const { projectId } = req.params

  try {
    const columns = await prisma.column.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: {
        cards: {
          orderBy: { order: 'asc' },
          include: {
            assignees: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    })

    return res.status(200).json({ columns })
  } catch (err) {
    console.error('Get columns error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateColumn = async (req, res) => {
  const { columnId } = req.params
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Column name is required' })
  }

  try {
    const column = await prisma.column.update({
      where: { id: columnId },
      data: { name: name.trim() },
    })

    return res.status(200).json({ column })
  } catch (err) {
    console.error('Update column error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteColumn = async (req, res) => {
  const { columnId } = req.params

  try {
    await prisma.column.delete({ where: { id: columnId } })
    return res.status(200).json({ message: 'Column deleted successfully' })
  } catch (err) {
    console.error('Delete column error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const reorderColumns = async (req, res) => {
  const { projectId } = req.params
  const { columns } = req.body

  // columns = [{ id, order }, { id, order }, ...]
  if (!Array.isArray(columns)) {
    return res.status(400).json({ error: 'columns must be an array' })
  }

  try {
    await prisma.$transaction(
      columns.map((col) =>
        prisma.column.update({
          where: { id: col.id },
          data: { order: col.order },
        })
      )
    )

    return res.status(200).json({ message: 'Columns reordered' })
  } catch (err) {
    console.error('Reorder columns error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}