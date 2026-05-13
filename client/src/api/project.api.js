import api from "./axios.js";

export const createProjectApi = (workspaceId, data) =>
  api.post(`/workspaces/${workspaceId}/projects`, data);

export const getProjectsApi = (workspaceId) =>
  api.get(`/workspaces/${workspaceId}/projects`);

export const getProjectApi = (projectId) => api.get(`/projects/${projectId}`);

export const updateProjectApi = (projectId, data) =>
  api.put(`/projects/${projectId}`, data);

export const deleteProjectApi = (projectId) =>
  api.delete(`/projects/${projectId}`);

export const inviteProjectMemberApi = (projectId, data) =>
  api.post(`/projects/${projectId}/invite`, data);

export const removeProjectMemberApi = (projectId, userId) =>
  api.delete(`/projects/${projectId}/members/${userId}`);
