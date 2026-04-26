import { Router } from 'express'
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteProjectMember,
} from '../controllers/project.controller.js'
import { authenticate } from '../middleware/auth.js'
import {
  requireWorkspaceMember,
  requireProjectMember,
  requireProjectAdmin,
} from '../middleware/workspace.js'

const router = Router({ mergeParams: true })

router.use(authenticate)

router.post('/', requireWorkspaceMember, createProject)
router.get('/', requireWorkspaceMember, getProjects)
router.get('/:projectId', requireProjectMember, getProject)
router.put('/:projectId', requireProjectAdmin, updateProject)
router.delete('/:projectId', requireProjectAdmin, deleteProject)
router.post('/:projectId/invite', requireProjectAdmin, inviteProjectMember)

export default router