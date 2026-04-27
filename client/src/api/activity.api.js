import api from "./axios.js";

export const getWorkspaceActivitiesApi = (workspaceId, cursor) =>
  api.get(`/workspaces/${workspaceId}/activities`, { params: { cursor } });
export const getProjectActivitiesApi = (projectId, cursor) =>
  api.get(`/projects/${projectId}/activities`, { params: { cursor } });
