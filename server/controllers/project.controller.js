import prisma from '../lib/prisma.js'

export const createProject = async (req, res) => {
  const { workspaceId } = req.params
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' })
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        workspaceId,
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

    return res.status(201).json({ project })
  } catch (err) {
    console.error('Create project error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProjects = async (req, res) => {
  const { workspaceId } = req.params

  try {
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ projects })
  } catch (err) {
    console.error('Get projects error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProject = async (req, res) => {
  const { projectId } = req.params

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    return res.status(200).json({ project })
  } catch (err) {
    console.error('Get project error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProject = async (req, res) => {
  const { projectId } = req.params
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' })
  }

  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name.trim(),
        description: description?.trim(),
      },
    })

    return res.status(200).json({ project })
  } catch (err) {
    console.error('Update project error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteProject = async (req, res) => {
  const { projectId } = req.params

  try {
    await prisma.project.delete({ where: { id: projectId } })
    return res.status(200).json({ message: 'Project deleted successfully' })
  } catch (err) {
    console.error('Delete project error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const inviteProjectMember = async (req, res) => {
  const { projectId } = req.params
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

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: user.id },
      },
    })

    if (existing) {
      return res.status(409).json({ error: 'User is already a member' })
    }

    const member = await prisma.projectMember.create({
      data: { projectId, userId: user.id, role: assignedRole },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    return res.status(201).json({ member })
  } catch (err) {
    console.error('Invite project member error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}