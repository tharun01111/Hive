import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) =>
    set({
      notifications,
      unreadCount,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.notifications.find((n) => n.id === id && !n.read)
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    })),
}));
