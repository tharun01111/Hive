import { create } from "zustand";
import { setApiToken } from "../api/axios.js";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    setApiToken(accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  setAccessToken: (accessToken) => {
    setApiToken(accessToken);
    set({ accessToken });
  },

  logout: () => {
    setApiToken(null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
