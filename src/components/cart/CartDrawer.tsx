"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { useQuote } from "@/hooks/useQuote";
import { usePrice } from "@/components/providers/SettingsProvider";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingProgress } from "./FreeShippingProgress";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const pathname = usePathname();
  const format = usePrice();
  const { quote, loading } = useQuote(isOpen);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const issues = new Map(quote?.lines.map((l) => [l.variantId, l.issue]));
  const subtotal = quote?.subtotal ?? lines.reduce((s, l) => s + l.price * l.quantity, 0);

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-[60] bg-charcoal/50 backdrop-blur-[2px] transition-opacity duration-500",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
        className={clsx(
          "fixed top-0 right-0 bottom-0 z-[61] flex w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-500 ease-[var(--ease-luxe)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <h2 className="font-serif text-2xl text-charcoal">
            Your Bag <span className="text-base text-taupe">({cartCount(lines)})</span>
          </h2>
          <button onClick={close} className="p-1 text-ink hover:text-gold" aria-label="Close bag">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <ShoppingBag size={40} strokeWidth={1} className="text-taupe" />
            <p className="font-serif text-2xl text-charcoal">Your bag is empty</p>
            <p className="text-sm text-ink/60">Discover a scent that feels like you.</p>
            <Link href="/shop" onClick={close} className="btn-primary mt-2">
              Explore perfumes
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-sand px-6 py-4">
              <FreeShippingProgress subtotal={subtotal} />
            </div>
            <div className="flex-1 divide-y divide-sand overflow-y-auto px-6">
              {lines.map((line) => (
                <CartLineItem key={line.variantId} line={line} issue={issues.get(line.variantId)} compact />
              ))}
            </div>
            <div className="space-y-4 border-t border-sand bg-cream px-6 py-6">
              <div className="flex items-center justify-between text-sm">
                <span className="eyebrow text-ink/70">Subtotal</span>
                <span className={clsx("font-serif text-2xl text-charcoal", loading && "opacity-50")}>{format(subtotal)}</span>
              </div>
              <p className="text-xs text-ink/60">Delivery calculated at checkout. Pay with cash on delivery.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={close} className="btn-outline">
                  View bag
                </Link>
                <Link href="/checkout" onClick={close} className="btn-primary">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
