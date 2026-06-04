import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface AdminAuthState {
  admin: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: User, token: string) => void;
  setAdmin: (admin: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      setAuth: (admin, token) => set({ admin, token, isAuthenticated: true }),
      setAdmin: (admin) => set({ admin }),
      clearAuth: () => set({ admin: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "rental-admin-auth",
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
