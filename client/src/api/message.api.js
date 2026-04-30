import api from "./axios.js";

export const getMessagesApi = (projectId, cursor) =>
  api.get(`/projects/${projectId}/messages`, { params: { cursor } });
export const createMessageApi = (projectId, data) =>
  api.post(`/projects/${projectId}/messages`, data);
export const deleteMessageApi = (projectId, messageId) =>
  api.delete(`/projects/${projectId}/messages/${messageId}`);
