"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Quote } from "@/lib/types";
import { toQuoteInput, useCart } from "@/store/cart";

/**
 * Prices the current cart on the server (live prices, stock and shipping) and
 * refreshes the local line snapshots with whatever changed.
 */
export function useQuote(enabled = true) {
  const lines = useCart((s) => s.lines);
  const key = lines.map((l) => `${l.variantId}:${l.quantity}`).join(",");
  const [nonce, setNonce] = useState(0);
  const requestKey = `${key}|${nonce}`;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;
    const items = toQuoteInput(useCart.getState().lines);
    if (!items.length) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await api<{ quote: Quote }>("/cart/quote", { method: "POST", body: { items } });
        if (cancelled) return;
        setQuote(res.quote);
        setError(false);

        const byId = new Map(res.quote.lines.map((l) => [l.variantId, l]));
        const missing = new Set(res.quote.missingVariantIds);
        useCart.setState((s) => ({
          lines: s.lines
            .filter((l) => !missing.has(l.variantId))
            .map((l) => {
              const q = byId.get(l.variantId);
              return q
                ? {
                    ...l,
                    name: q.name,
                    variantLabel: q.variantLabel,
                    slug: q.slug,
                    image: q.image,
                    price: q.price,
                    compareAtPrice: q.compareAtPrice,
                    stock: q.stock,
                  }
                : l;
            }),
        }));
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setSettledKey(requestKey);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, requestKey, enabled]);

  return {
    quote: key ? quote : null,
    loading: enabled && !!key && settledKey !== requestKey,
    error,
    refresh,
  };
}
