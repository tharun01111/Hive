import api from "./axios.js";

export const createProjectApi = (workspaceId, data) =>
  api.post(`/workspaces/${workspaceId}/projects`, data);
export const getProjectsApi = (workspaceId) =>
  api.get(`/workspaces/${workspaceId}/projects`);
export const getProjectApi = (projectId) =>
  api.get(`/workspaces/projects/${projectId}`);
export const updateProjectApi = (projectId, data) =>
  api.put(`/workspaces/projects/${projectId}`, data);
export const deleteProjectApi = (projectId) =>
  api.delete(`/workspaces/projects/${projectId}`);
