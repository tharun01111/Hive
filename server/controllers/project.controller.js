import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteProjectMember,
  removeProjectMember,
} from "../services/project.service.js";
import { handle } from "../utils/controllerHandler.js";

export const createProjectController = handle(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Project name is required" });
  const project = await createProject({
    name,
    description,
    workspaceId: req.params.workspaceId,
    userId: req.userId,
  });
  return res.status(201).json({ project });
});

export const getProjects = handle(async (req, res) => {
  const projects = await getWorkspaceProjects(req.params.workspaceId);
  return res.status(200).json({ projects });
});

export const getProject = handle(async (req, res) => {
  const project = await getProjectById(req.params.projectId);
  return res.status(200).json({ project });
});

export const updateProjectController = handle(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Project name is required" });
  const project = await updateProject(req.params.projectId, {
    name,
    description,
  });
  return res.status(200).json({ project });
});

export const deleteProjectController = handle(async (req, res) => {
  await deleteProject(req.params.projectId);
  return res.status(200).json({ message: "Project deleted successfully" });
});

export const inviteProjectMemberController = handle(async (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  const member = await inviteProjectMember(req.params.projectId, {
    email,
    role,
  });
  return res.status(201).json({ member });
});

export const removeProjectMemberController = handle(async (req, res) => {
  await removeProjectMember(req.params.projectId, req.params.userId, req.userId);
  return res.status(200).json({ message: "Member removed from project" });
});
