"use client";

import clsx from "clsx";
import { usePrice, useSettings } from "@/components/providers/SettingsProvider";
import type { Quote } from "@/lib/types";

/** Subtotal / delivery / total rows. Falls back to a local estimate until the server quote arrives. */
export function OrderTotals({ quote, subtotal, loading }: { quote: Quote | null; subtotal: number; loading?: boolean }) {
  const settings = useSettings();
  const format = usePrice();
  const threshold = settings.freeShippingThreshold;
  const shipping = quote?.shippingFee ?? (threshold != null && subtotal >= threshold ? 0 : settings.shippingFee);
  const total = quote?.total ?? subtotal + shipping;

  return (
    <dl className={clsx("space-y-3 text-sm transition-opacity", loading && "opacity-60")}>
      <div className="flex justify-between">
        <dt className="text-ink/70">Subtotal</dt>
        <dd className="text-charcoal">{format(quote?.subtotal ?? subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink/70">Delivery</dt>
        <dd className={shipping === 0 ? "text-gold" : "text-charcoal"}>{shipping === 0 ? "Complimentary" : format(shipping)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-sand pt-4">
        <dt className="eyebrow text-ink">Total</dt>
        <dd className="font-serif text-3xl text-charcoal">{format(total)}</dd>
      </div>
    </dl>
  );
}
