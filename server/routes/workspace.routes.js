import { Router } from 'express'
import {
  createWorkspaceController,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspaceController,
  deleteWorkspaceController,
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

router.post('/', createWorkspaceController)
router.get('/', getMyWorkspaces)
router.get('/:workspaceId', requireWorkspaceMember, getWorkspace)
router.put('/:workspaceId', requireWorkspaceAdmin, updateWorkspaceController)
router.delete('/:workspaceId', requireWorkspaceAdmin, deleteWorkspaceController)
router.post('/:workspaceId/invite', requireWorkspaceAdmin, inviteMember)
router.delete('/:workspaceId/members/:userId', requireWorkspaceAdmin, removeMember)

export default router