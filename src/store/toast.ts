"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToast = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (message, tone = "success") => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, tone }] }));
    setTimeout(() => get().dismiss(id), 3800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (message: string, tone?: Toast["tone"]) => useToast.getState().push(message, tone);
