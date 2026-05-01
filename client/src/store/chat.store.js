import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  nextCursor: null,
  typingUsers: [],

  setMessages: (messages, nextCursor) => set({ messages, nextCursor }),

  addMessage: (message) =>
    set((state) => ({
      messages: state.messages.some((m) => m.id === message.id)
        ? state.messages.map((m) =>
            m.id === message.id ? { ...m, ...message } : m,
          )
        : [...state.messages, message],
    })),

  confirmMessage: (clientId, message) =>
    set((state) => ({
      messages: state.messages.some((m) => m.id === clientId)
        ? state.messages.map((m) => (m.id === clientId ? message : m))
        : state.messages.some((m) => m.id === message.id)
          ? state.messages.map((m) =>
              m.id === message.id ? { ...m, ...message } : m,
            )
          : [...state.messages, message],
    })),

  markMessageFailed: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, pending: false, failed: true } : m,
      ),
    })),

  prependMessages: (messages, nextCursor) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
      nextCursor,
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),

  addTypingUser: (user) =>
    set((state) => ({
      typingUsers: state.typingUsers.find((u) => u.userId === user.userId)
        ? state.typingUsers
        : [...state.typingUsers, user],
    })),

  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u.userId !== userId),
    })),

  clearChat: () => set({ messages: [], nextCursor: null, typingUsers: [] }),
}));
