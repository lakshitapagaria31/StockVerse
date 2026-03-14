import { create } from "zustand";

import { api, AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "@/services/api";

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, _password: string) => Promise<boolean>;
  signup: (name: string, email: string, _password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)),
  user: localStorage.getItem(AUTH_USER_STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(AUTH_USER_STORAGE_KEY)!)
    : null,
  login: async (email, password) => {
    try {
      const response = await api.auth.login({ email, password });
      const user = { name: response.user.name, email: response.user.email };
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.access_token);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      set({ isAuthenticated: true, user });
      return true;
    } catch {
      return false;
    }
  },
  signup: async (name, email, password) => {
    try {
      const response = await api.auth.signup({ name, email, password, role: "staff" });
      const user = { name: response.user.name, email: response.user.email };
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.access_token);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      set({ isAuthenticated: true, user });
      return true;
    } catch {
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    set({ isAuthenticated: false, user: null });
  },
}));
