"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "innerspark-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
