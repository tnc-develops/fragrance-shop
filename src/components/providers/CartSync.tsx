"use client";

import { useEffect, useRef } from "react";
import { api, ApiError } from "@/lib/api";
import type { Quote } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { toQuoteInput, useCart, type CartLine } from "@/store/cart";
import { useHydrated } from "./SettingsProvider";

interface CartResponse {
  items: { variantId: number; quantity: number }[];
  quote: Quote;
}

const signature = (lines: CartLine[]) => lines.map((l) => `${l.variantId}:${l.quantity}`).join(",");

/**
 * Keeps the persisted local cart and the logged-in user's server cart in step:
 * guest cart is merged on login, the server copy wins on later visits, and
 * local edits are pushed back (debounced).
 */
export function CartSync() {
  const hydrated = useHydrated();
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.user?.id);
  const ready = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    ready.current = false;
    const cart = useCart.getState();

    if (!token || !userId) {
      if (cart.owner !== "guest") {
        cart.clear();
        cart.setOwner("guest");
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res =
          cart.owner === userId
            ? await api<CartResponse>("/cart", { token })
            : await api<CartResponse>("/cart/merge", {
                method: "POST",
                token,
                body: { items: cart.owner === "guest" ? toQuoteInput(cart.lines) : [] },
              });
        if (cancelled) return;
        useCart.getState().replaceFromQuote(res.quote.lines, userId);
        ready.current = true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) useAuth.getState().logout();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, userId]);

  useEffect(() => {
    if (!token) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useCart.subscribe((state, prev) => {
      if (!ready.current || signature(state.lines) === signature(prev.lines)) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        api("/cart", { method: "PUT", token, body: { items: toQuoteInput(useCart.getState().lines) } }).catch(() => {});
      }, 600);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [token]);

  return null;
}
