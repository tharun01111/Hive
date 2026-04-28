import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteWorkspaceMember,
  removeWorkspaceMember,
} from '../services/workspace.service.js'
import { handle } from '../utils/controllerHandler.js'

export const createWorkspaceController = handle(async (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'Workspace name is required' })
  const workspace = await createWorkspace({ name, description, userId: req.userId })
  return res.status(201).json({ workspace })
})

export const getMyWorkspaces = handle(async (req, res) => {
  const workspaces = await getUserWorkspaces(req.userId)
  return res.status(200).json({ workspaces })
})

export const getWorkspace = handle(async (req, res) => {
  const workspace = await getWorkspaceById(req.params.workspaceId)
  return res.status(200).json({ workspace })
})

export const updateWorkspaceController = handle(async (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'Workspace name is required' })
  const workspace = await updateWorkspace(req.params.workspaceId, { name, description })
  return res.status(200).json({ workspace })
})

export const deleteWorkspaceController = handle(async (req, res) => {
  await deleteWorkspace(req.params.workspaceId)
  return res.status(200).json({ message: 'Workspace deleted successfully' })
})

export const inviteMember = handle(async (req, res) => {
  const { email, role } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })
  const member = await inviteWorkspaceMember(req.params.workspaceId, { email, role })
  return res.status(201).json({ member })
})

export const removeMember = handle(async (req, res) => {
  await removeWorkspaceMember(
    req.params.workspaceId,
    req.params.userId,
    req.userId
  )
  return res.status(200).json({ message: 'Member removed successfully' })
})