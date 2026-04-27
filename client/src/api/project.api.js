import api from "./axios.js";

export const createProjectApi = (workspaceId, data) =>
  api.post(`/workspaces/${workspaceId}/projects`, data);

export const getProjectsApi = (workspaceId) =>
  api.get(`/workspaces/${workspaceId}/projects`);

export const getProjectApi = (projectId) =>
  api.get(`/projects/direct/${projectId}`);

export const updateProjectApi = (projectId, data) =>
  api.put(`/projects/direct/${projectId}`, data);

export const deleteProjectApi = (projectId) =>
  api.delete(`/projects/direct/${projectId}`);
