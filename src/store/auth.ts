import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, _password: string) => Promise<boolean>;
  signup: (name: string, email: string, _password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: localStorage.getItem("coreinventory-auth") === "true",
  user: localStorage.getItem("coreinventory-user")
    ? JSON.parse(localStorage.getItem("coreinventory-user")!)
    : null,
  login: async (email, _password) => {
    // Mock login — replace with real API
    const user = { name: email.split("@")[0], email };
    localStorage.setItem("coreinventory-auth", "true");
    localStorage.setItem("coreinventory-user", JSON.stringify(user));
    set({ isAuthenticated: true, user });
    return true;
  },
  signup: async (name, email, _password) => {
    const user = { name, email };
    localStorage.setItem("coreinventory-auth", "true");
    localStorage.setItem("coreinventory-user", JSON.stringify(user));
    set({ isAuthenticated: true, user });
    return true;
  },
  logout: () => {
    localStorage.removeItem("coreinventory-auth");
    localStorage.removeItem("coreinventory-user");
    set({ isAuthenticated: false, user: null });
  },
}));
