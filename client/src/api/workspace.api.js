import api from "./axios.js";

export const createWorkspaceApi = (data) => api.post("/workspaces", data);
export const getWorkspacesApi = () => api.get("/workspaces");
export const getWorkspaceApi = (id) => api.get(`/workspaces/${id}`);
export const updateWorkspaceApi = (id, data) =>
  api.put(`/workspaces/${id}`, data);
export const deleteWorkspaceApi = (id) => api.delete(`/workspaces/${id}`);
export const inviteMemberApi = (id, data) =>
  api.post(`/workspaces/${id}/invite`, data);
export const removeMemberApi = (workspaceId, userId) =>
  api.delete(`/workspaces/${workspaceId}/members/${userId}`);
