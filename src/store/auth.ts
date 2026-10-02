"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "fbs-auth" },
  ),
);

interface SessionResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string) {
  const session = await api<SessionResponse>("/auth/login", { method: "POST", body: { email, password } });
  useAuth.getState().setSession(session.token, session.user);
  return session.user;
}

export async function register(input: { name: string; email: string; password: string; phone?: string }) {
  const session = await api<SessionResponse>("/auth/register", { method: "POST", body: input });
  useAuth.getState().setSession(session.token, session.user);
  return session.user;
}
