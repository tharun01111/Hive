import { create } from 'zustand'

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  activeWorkspace: null,

  setWorkspaces: (workspaces) => set({ workspaces }),

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  addWorkspace: (workspace) => set((state) => ({
    workspaces: [workspace, ...state.workspaces],
  })),

  updateWorkspace: (id, data) => set((state) => ({
    workspaces: state.workspaces.map((w) =>
      w.id === id ? { ...w, ...data } : w
    ),
    activeWorkspace: state.activeWorkspace?.id === id
      ? { ...state.activeWorkspace, ...data }
      : state.activeWorkspace,
  })),

  removeWorkspace: (id) => set((state) => ({
    workspaces: state.workspaces.filter((w) => w.id !== id),
    activeWorkspace: state.activeWorkspace?.id === id
      ? null
      : state.activeWorkspace,
  })),
}))