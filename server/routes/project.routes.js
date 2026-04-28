import { Router } from 'express'
import {
  createProjectController,
  getProjects,
  getProject,
  updateProjectController,
  deleteProjectController,
  inviteProjectMemberController,
} from '../controllers/project.controller.js'
import { authenticate } from '../middleware/auth.js'
import {
  requireWorkspaceMember,
  requireProjectMember,
  requireProjectAdmin,
} from '../middleware/workspace.js'
import prisma from '../lib/prisma.js'

const router = Router({ mergeParams: true })

router.use(authenticate)

router.post('/', requireWorkspaceMember, createProjectController)
router.get('/', requireWorkspaceMember, getProjects)
router.get('/:projectId', requireProjectMember, getProject)
router.put('/:projectId', requireProjectAdmin, updateProjectController)
router.delete('/:projectId', requireProjectAdmin, deleteProjectController)
router.post('/:projectId/invite', requireProjectAdmin, inviteProjectMemberController)

// Direct project fetch by ID — used by frontend without workspaceId
router.get('/direct/:projectId', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
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
    if (!project) return res.status(404).json({ error: 'Project not found' })
    return res.status(200).json({ project })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router