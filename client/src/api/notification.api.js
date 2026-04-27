import api from "./axios.js";

export const getNotificationsApi = () => api.get("/notifications");
export const markAsReadApi = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsReadApi = () => api.patch("/notifications/read-all");
export const deleteNotificationApi = (id) => api.delete(`/notifications/${id}`);
