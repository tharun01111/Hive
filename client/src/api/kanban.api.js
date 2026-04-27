import api from "./axios.js";

export const getColumnsApi = (projectId) =>
  api.get(`/projects/${projectId}/columns`);
export const createColumnApi = (projectId, data) =>
  api.post(`/projects/${projectId}/columns`, data);
export const updateColumnApi = (projectId, columnId, data) =>
  api.put(`/projects/${projectId}/columns/${columnId}`, data);
export const deleteColumnApi = (projectId, columnId) =>
  api.delete(`/projects/${projectId}/columns/${columnId}`);
export const reorderColumnsApi = (projectId, data) =>
  api.put(`/projects/${projectId}/columns/reorder`, data);

export const getCardApi = (projectId, cardId) =>
  api.get(`/projects/${projectId}/cards/${cardId}`);
export const createCardApi = (projectId, columnId, data) =>
  api.post(`/projects/${projectId}/columns/${columnId}/cards`, data);
export const updateCardApi = (projectId, cardId, data) =>
  api.put(`/projects/${projectId}/cards/${cardId}`, data);
export const deleteCardApi = (projectId, cardId) =>
  api.delete(`/projects/${projectId}/cards/${cardId}`);
export const moveCardApi = (projectId, cardId, data) =>
  api.put(`/projects/${projectId}/cards/${cardId}/move`, data);
