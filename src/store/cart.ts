"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuoteLine } from "@/lib/types";

export const MAX_QTY = 99;

/** One line per bottle size. */
export interface CartLine {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  variantLabel: string | null;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  quantity: number;
}

type Owner = number | "guest";

interface CartState {
  lines: CartLine[];
  /** Which account the lines belong to, so a guest cart can be merged on login. */
  owner: Owner;
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  replaceFromQuote: (lines: QuoteLine[], owner?: Owner) => void;
  setOwner: (owner: Owner) => void;
  open: () => void;
  close: () => void;
}

const cap = (qty: number, stock: number) => Math.max(0, Math.min(qty, MAX_QTY, stock > 0 ? stock : MAX_QTY));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      owner: "guest",
      isOpen: false,
      add: (line, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, ...line, quantity: cap(l.quantity + quantity, line.stock) }
                  : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, quantity: cap(quantity, line.stock) }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.variantId !== variantId)
              : s.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: cap(quantity, l.stock) } : l)),
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
      replaceFromQuote: (quoteLines, owner) =>
        set((s) => ({
          owner: owner ?? s.owner,
          lines: quoteLines.map((q) => ({
            variantId: q.variantId,
            productId: q.productId,
            slug: q.slug,
            name: q.name,
            variantLabel: q.variantLabel,
            image: q.image,
            price: q.price,
            compareAtPrice: q.compareAtPrice,
            stock: q.stock,
            quantity: q.quantity,
          })),
        })),
      setOwner: (owner) => set({ owner }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "fbs-cart",
      // v1 lines were per product (no size); they cannot be mapped to a size, so they are dropped.
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as { lines?: CartLine[]; owner?: Owner };
        return version < 1 ? { lines: [], owner: state.owner ?? "guest" } : state;
      },
      partialize: (s) => ({ lines: s.lines, owner: s.owner }),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);

export const toQuoteInput = (lines: CartLine[]) =>
  lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
