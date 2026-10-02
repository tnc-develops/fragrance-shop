"use client";

import clsx from "clsx";
import { usePrice } from "@/components/providers/SettingsProvider";

interface Props {
  price: number;
  salePrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Prefix with "From" when the product comes in sizes with different prices. */
  from?: boolean;
}

export function Price({ price, salePrice, className, size = "md", from = false }: Props) {
  const format = usePrice();
  const onSale = salePrice != null && salePrice < price;
  const text = { sm: "text-sm", md: "text-base", lg: "text-2xl" }[size];

  return (
    <span className={clsx("inline-flex items-baseline gap-2", text, className)}>
      {from && <span className="text-[0.75em] tracking-[0.15em] text-taupe uppercase">From</span>}
      <span className={clsx("font-medium tracking-wide", onSale ? "text-gold" : "text-charcoal")}>
        {format(onSale ? salePrice! : price)}
      </span>
      {onSale && <span className="text-[0.8em] text-taupe line-through">{format(price)}</span>}
    </span>
  );
}
