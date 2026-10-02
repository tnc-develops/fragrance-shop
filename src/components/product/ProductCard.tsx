"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { effectivePrice, imageUrl } from "@/lib/format";
import { defaultVariant, priceRange, variantImages, variantLabel } from "@/lib/variants";
import { Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";
import { AddToCartButton } from "./AddToCartButton";

const LOW_STOCK = 5;

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { variants } = product;
  const primary = defaultVariant(product);
  const multiSize = variants.length > 1;
  const href = `/product/${product.slug}`;

  const [first, second] = product.images.length ? product.images : variantImages(product, primary);
  const src = imageUrl(first?.url);
  const hoverSrc = imageUrl(second?.url);

  const range = priceRange(product);
  // Show the cheapest size's price (with its sale strike-through) when sizes differ in price.
  const shown = multiSize ? variants.reduce((a, b) => (effectivePrice(b) < effectivePrice(a) ? b : a)) : primary;
  const onSaleVariants = variants.filter((v) => v.salePrice !== null && v.salePrice < v.price);
  const soldOut = variants.every((v) => v.stock <= 0);
  const single = !multiSize ? primary : undefined;
  const discount = onSaleVariants.reduce((best, v) => Math.max(best, Math.round((1 - (v.salePrice ?? v.price) / v.price) * 100)), 0);
  const sizes = variants.map((v) => variantLabel(v)).filter(Boolean).join(" · ");
  const offerSizes = multiSize ? onSaleVariants.map((v) => variantLabel(v)).filter(Boolean).join(", ") : "";

  return (
    <article className="group relative flex flex-col border border-sand bg-cream transition-all duration-500 hover:border-gold/50 hover:shadow-[0_24px_50px_-30px_rgba(48,37,31,0.45)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <Link href={href} className="absolute inset-0 block" aria-label={product.name}>
          {src && (
            <Image
              src={src}
              alt={first?.alt ?? product.name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
              loading={priority ? "eager" : "lazy"}
              className={`object-contain p-6 transition-all duration-700 ease-[var(--ease-luxe)] group-hover:scale-105 ${hoverSrc ? "group-hover:opacity-0" : ""}`}
            />
          )}
          {hoverSrc && (
            <Image
              src={hoverSrc}
              alt=""
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
              className="object-contain p-6 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="bg-charcoal px-2.5 py-1 text-[10px] tracking-[0.2em] text-ivory uppercase">Sold out</span>
          ) : (
            <>
              {onSaleVariants.length > 0 && (
                <span className="bg-gold px-2.5 py-1 text-[10px] tracking-[0.2em] text-charcoal uppercase">
                  {!discount ? "Sale" : multiSize && onSaleVariants.length < variants.length ? `Up to -${discount}%` : `-${discount}%`}
                </span>
              )}
              {single && single.stock <= LOW_STOCK && (
                <span className="bg-ivory px-2.5 py-1 text-[10px] tracking-[0.2em] text-espresso uppercase">Only {single.stock} left</span>
              )}
            </>
          )}
        </div>

        <div className="absolute right-3 bottom-3 md:hidden">
          {multiSize ? (
            <Link
              href={href}
              aria-label={`Choose a size of ${product.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-ivory shadow-lg"
            >
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          ) : (
            <AddToCartButton product={product} variant={primary} appearance="icon" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4 text-center md:p-5">
        {product.brand && <p className="eyebrow text-[10px] text-taupe">{product.brand}</p>}
        <h3 className="font-serif text-lg leading-snug text-charcoal md:text-xl">
          <Link href={href} className="transition-colors hover:text-gold">
            {product.name}
          </Link>
        </h3>
        {sizes && <p className="text-[11px] tracking-[0.12em] text-taupe">{sizes}</p>}
        {offerSizes && !soldOut && <p className="text-[11px] font-medium tracking-[0.12em] text-gold brightness-90">Offer on {offerSizes}</p>}
        {product.ratingCount > 0 && (
          <div className="flex items-center justify-center gap-1.5">
            <StarRating value={product.ratingAvg} size={12} />
            <span className="text-[11px] text-taupe">({product.ratingCount})</span>
          </div>
        )}
        <Price
          price={shown?.price ?? product.price}
          salePrice={shown ? shown.salePrice : product.salePrice}
          from={range.min !== range.max}
          className="mt-1 justify-center"
        />
        <div className="mt-auto hidden pt-4 md:block">
          <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
            {multiSize ? (
              <Link href={href} className="btn-outline w-full py-3 text-[11px]">
                Choose size <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            ) : (
              <AddToCartButton product={product} variant={primary} appearance="card" />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
