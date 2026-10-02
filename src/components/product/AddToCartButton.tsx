"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, ShoppingBag } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/types";
import { effectivePrice } from "@/lib/format";
import { variantImages, variantLabel } from "@/lib/variants";
import { useCart } from "@/store/cart";
import { toast } from "@/store/toast";

interface Props {
  product: Product;
  /** The size to add. */
  variant: ProductVariant | undefined;
  quantity?: number;
  appearance?: "full" | "icon" | "card";
  openDrawer?: boolean;
  className?: string;
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  appearance = "full",
  openDrawer = true,
  className,
}: Props) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const inCart = useCart((s) => s.lines.find((l) => l.variantId === variant?.id)?.quantity ?? 0);
  const [added, setAdded] = useState(false);

  const stock = variant?.stock ?? 0;
  const soldOut = stock <= 0;
  const label = variant ? variantLabel(variant) : null;
  const displayName = label ? `${product.name} (${label})` : product.name;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || soldOut) return;
    if (inCart >= stock) {
      toast(`Only ${stock} available - all are already in your bag`, "info");
      return;
    }
    const price = effectivePrice(variant);
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantLabel: label,
        image: variantImages(product, variant)[0]?.url ?? null,
        price,
        compareAtPrice: price < variant.price ? variant.price : null,
        stock,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    if (openDrawer) open();
    else toast(`${displayName} added to your bag`);
  }

  if (appearance === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={soldOut}
        aria-label={soldOut ? "Sold out" : `Add ${displayName} to bag`}
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-ivory shadow-lg transition-colors hover:bg-gold hover:text-charcoal disabled:bg-taupe",
          className,
        )}
      >
        {added ? <Check size={16} /> : <ShoppingBag size={16} strokeWidth={1.5} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={soldOut}
      className={clsx(appearance === "card" ? "btn-primary w-full py-3 text-[11px]" : "btn-primary w-full", className)}
    >
      {soldOut ? (
        "Sold out"
      ) : added ? (
        <>
          <Check size={15} /> Added to bag
        </>
      ) : (
        <>
          <ShoppingBag size={15} strokeWidth={1.5} /> Add to bag
        </>
      )}
    </button>
  );
}
