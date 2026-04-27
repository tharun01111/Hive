import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  nextCursor: null,
  typingUsers: [],

  setMessages: (messages, nextCursor) => set({ messages, nextCursor }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
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
