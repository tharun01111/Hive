import prisma from '../lib/prisma.js'

export const getWorkspaceActivities = async (req, res) => {
  const { workspaceId } = req.params
  const { cursor, limit = 50 } = req.query

  try {
    const activities = await prisma.activity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    const nextCursor = activities.length === Number(limit)
      ? activities[activities.length - 1].id
      : null

    return res.status(200).json({ activities, nextCursor })
  } catch (err) {
    console.error('Get activities error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProjectActivities = async (req, res) => {
  const { projectId } = req.params
  const { cursor, limit = 50 } = req.query

  try {
    const activities = await prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    const nextCursor = activities.length === Number(limit)
      ? activities[activities.length - 1].id
      : null

    return res.status(200).json({ activities, nextCursor })
  } catch (err) {
    console.error('Get project activities error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}