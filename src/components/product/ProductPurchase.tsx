"use client";

import { useState } from "react";
import { Check, Truck } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/types";
import { useSettings, usePrice } from "@/components/providers/SettingsProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { AddToCartButton } from "./AddToCartButton";

export function ProductPurchase({ product, variant }: { product: Product; variant: ProductVariant | undefined }) {
  const [qty, setQty] = useState(1);
  const settings = useSettings();
  const format = usePrice();
  const stock = variant?.stock ?? 0;
  const soldOut = stock <= 0;

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 text-sm">
        {soldOut ? (
          <span className="text-espresso">
            {product.variants.length > 1 ? "This size is currently sold out" : "Currently sold out"}
          </span>
        ) : stock <= 5 ? (
          <>
            <span className="h-2 w-2 rounded-full bg-gold" />
            <span className="text-espresso">Only {stock} left - order soon</span>
          </>
        ) : (
          <>
            <Check size={15} className="text-gold" />
            <span className="text-ink/70">In stock, ready to ship</span>
          </>
        )}
      </p>

      <div className="flex gap-3">
        {!soldOut && <QuantityStepper value={qty} onChange={setQty} max={Math.min(99, stock)} />}
        <AddToCartButton product={product} variant={variant} quantity={qty} className="flex-1" />
      </div>

      <div className="flex items-start gap-3 border border-sand bg-cream p-4 text-xs leading-relaxed text-ink/70">
        <Truck size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
        <p>
          {settings.freeShippingThreshold
            ? `Free delivery and a complimentary gift on orders over ${format(settings.freeShippingThreshold)}. `
            : ""}
          Pay securely with cash on delivery.
        </p>
      </div>
    </div>
  );
}
