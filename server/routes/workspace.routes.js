import { Router } from 'express'
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
} from '../controllers/workspace.controller.js'
import { authenticate } from '../middleware/auth.js'
import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from '../middleware/workspace.js'

const router = Router()

router.use(authenticate)

router.post('/', createWorkspace)
router.get('/', getMyWorkspaces)
router.get('/:workspaceId', requireWorkspaceMember, getWorkspace)
router.put('/:workspaceId', requireWorkspaceAdmin, updateWorkspace)
router.delete('/:workspaceId', requireWorkspaceAdmin, deleteWorkspace)
router.post('/:workspaceId/invite', requireWorkspaceAdmin, inviteMember)
router.delete('/:workspaceId/members/:userId', requireWorkspaceAdmin, removeMember)

export default router