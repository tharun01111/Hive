import { create } from "zustand";

export const usePresenceStore = create((set) => ({
  projectUsers: [],
  setProjectUsers: (users) => set({ projectUsers: users }),
  clearPresence: () => set({ projectUsers: [] }),
}));
