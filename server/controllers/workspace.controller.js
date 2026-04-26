import prisma from '../lib/prisma.js'

export const createWorkspace = async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Workspace name is required' })
  }

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        members: {
          create: {
            userId: req.userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    })

    return res.status(201).json({ workspace })
  } catch (err) {
    console.error('Create workspace error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId: req.userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ workspaces })
  } catch (err) {
    console.error('Get workspaces error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getWorkspace = async (req, res) => {
  const { workspaceId } = req.params

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    return res.status(200).json({ workspace })
  } catch (err) {
    console.error('Get workspace error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateWorkspace = async (req, res) => {
  const { workspaceId } = req.params
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Workspace name is required' })
  }

  try {
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: name.trim(),
        description: description?.trim(),
      },
    })

    return res.status(200).json({ workspace })
  } catch (err) {
    console.error('Update workspace error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteWorkspace = async (req, res) => {
  const { workspaceId } = req.params

  try {
    await prisma.workspace.delete({ where: { id: workspaceId } })
    return res.status(200).json({ message: 'Workspace deleted successfully' })
  } catch (err) {
    console.error('Delete workspace error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const inviteMember = async (req, res) => {
  const { workspaceId } = req.params
  const { email, role } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER'

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: user.id },
      },
    })

    if (existing) {
      return res.status(409).json({ error: 'User is already a member' })
    }

    const member = await prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role: assignedRole },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    return res.status(201).json({ member })
  } catch (err) {
    console.error('Invite member error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const removeMember = async (req, res) => {
  const { workspaceId, userId } = req.params

  if (userId === req.userId) {
    return res.status(400).json({ error: 'You cannot remove yourself' })
  }

  try {
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    })

    return res.status(200).json({ message: 'Member removed successfully' })
  } catch (err) {
    console.error('Remove member error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}