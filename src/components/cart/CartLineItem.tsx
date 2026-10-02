"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { imageUrl } from "@/lib/format";
import { useCart, type CartLine } from "@/store/cart";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "./QuantityStepper";

export function CartLineItem({ line, issue, compact = false }: { line: CartLine; issue?: string | null; compact?: boolean }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const close = useCart((s) => s.close);
  const src = imageUrl(line.image);
  const href = `/product/${line.slug}?variant=${line.variantId}`;
  const fullName = line.variantLabel ? `${line.name} (${line.variantLabel})` : line.name;

  return (
    <div className="flex gap-4 py-5">
      <Link
        href={href}
        onClick={close}
        className={`relative shrink-0 overflow-hidden border border-sand bg-white ${compact ? "h-24 w-20" : "h-32 w-28"}`}
      >
        {src && <Image src={src} alt={fullName} fill sizes="112px" className="object-contain p-2" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={close}
              className="font-serif text-lg leading-snug text-charcoal transition-colors hover:text-gold"
            >
              {line.name}
            </Link>
            {line.variantLabel && <p className="text-[11px] tracking-[0.15em] text-taupe uppercase">{line.variantLabel}</p>}
          </div>
          <button onClick={() => remove(line.variantId)} className="p-1 text-taupe transition-colors hover:text-espresso" aria-label={`Remove ${fullName}`}>
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
        <Price price={line.compareAtPrice ?? line.price} salePrice={line.compareAtPrice ? line.price : null} size="sm" className="mt-1" />
        {issue && <p className="mt-1 text-xs text-espresso">{issue}</p>}
        <div className="mt-auto pt-3">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={line.stock > 0 ? Math.min(99, line.stock) : 1}
            onChange={(q) => setQuantity(line.variantId, q)}
          />
        </div>
      </div>
    </div>
  );
}
