"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/store/cart";
import { useQuote } from "@/hooks/useQuote";
import { useHydrated } from "@/components/providers/SettingsProvider";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingProgress } from "./FreeShippingProgress";
import { OrderTotals } from "./OrderTotals";

export function CartView() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const { quote, loading, error } = useQuote(hydrated);

  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="h-64 animate-pulse bg-mist" />
        <div className="h-64 animate-pulse bg-mist" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center gap-5 border border-dashed border-sand py-24 text-center">
        <ShoppingBag size={44} strokeWidth={1} className="text-taupe" />
        <p className="font-serif text-3xl text-charcoal">Your bag is empty</p>
        <p className="max-w-sm text-sm text-ink/60">Discover a signature scent and it will wait for you here.</p>
        <Link href="/shop" className="btn-primary mt-3">
          Explore perfumes
        </Link>
      </div>
    );
  }

  const issues = new Map(quote?.lines.map((l) => [l.variantId, l.issue]));
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <div>
        <div className="flex items-center justify-between border-b border-sand pb-4">
          <p className="eyebrow text-ink/70">
            {lines.length} {lines.length === 1 ? "item" : "items"}
          </p>
          <button onClick={clear} className="eyebrow text-[10px] text-taupe transition-colors hover:text-espresso">
            Clear bag
          </button>
        </div>
        <div className="divide-y divide-sand border-b border-sand">
          {lines.map((line) => (
            <CartLineItem key={line.variantId} line={line} issue={issues.get(line.variantId)} />
          ))}
        </div>
        <Link href="/shop" className="link-underline eyebrow mt-8 inline-flex text-ink">
          Continue shopping
        </Link>
      </div>

      <aside className="space-y-6 border border-sand bg-cream p-6 md:p-8 lg:sticky lg:top-32">
        <h2 className="font-serif text-2xl text-charcoal">Order summary</h2>
        <FreeShippingProgress subtotal={quote?.subtotal ?? subtotal} />
        <OrderTotals quote={quote} subtotal={subtotal} loading={loading} />

        {quote?.hasIssues && (
          <p className="border border-gold/40 bg-gold/10 px-4 py-3 text-xs text-espresso">
            Some items need attention before checkout. Please adjust the highlighted quantities.
          </p>
        )}
        {error && <p className="text-xs text-espresso">We couldn&apos;t refresh prices right now. Totals are estimated.</p>}

        {quote?.hasIssues ? (
          <button disabled className="btn-primary w-full">
            Checkout <ArrowRight size={15} />
          </button>
        ) : (
          <Link href="/checkout" className="btn-primary w-full">
            Checkout <ArrowRight size={15} />
          </Link>
        )}

        <ul className="space-y-2 border-t border-sand pt-5 text-xs text-ink/60">
          <li className="flex items-center gap-2">
            <Truck size={14} className="text-gold" /> Island-wide cash on delivery
          </li>
          <li className="flex items-center gap-2">
            <Lock size={14} className="text-gold" /> Your details are kept private and secure
          </li>
        </ul>
      </aside>
    </div>
  );
}
