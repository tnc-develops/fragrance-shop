import type { Product, ProductImage, ProductVariant } from "./types";
import { effectivePrice } from "./format";

/** "Travel spray", "50 ml", or null when the variant has neither. */
export function variantLabel(v: Pick<ProductVariant, "label" | "sizeMl">): string | null {
  return v.label?.trim() || (v.sizeMl ? `${v.sizeMl} ml` : null);
}

/** The size shown first: the one marked default, else the first in stock, else the first. */
export function defaultVariant(product: Product): ProductVariant | undefined {
  const { variants } = product;
  return variants.find((v) => v.isDefault) ?? variants.find((v) => v.stock > 0) ?? variants[0];
}

/** Resolves `?size=50` or `?variant=12` to one of the product's sizes. */
export function findVariant(product: Product, query: { size?: string; variant?: string }): ProductVariant | undefined {
  const byId = Number(query.variant);
  if (byId) return product.variants.find((v) => v.id === byId);
  const ml = Number(query.size);
  if (ml) return product.variants.find((v) => v.sizeMl === ml);
  return undefined;
}

/** Query string that selects `variant`, preferring the readable `?size=` when the size is unique. */
export function variantQuery(product: Product, variant: ProductVariant): string {
  const sizeIsUnique = variant.sizeMl && product.variants.filter((v) => v.sizeMl === variant.sizeMl).length === 1;
  return sizeIsUnique ? `size=${variant.sizeMl}` : `variant=${variant.id}`;
}

/** A size's own photos, or the product's shared photos when it has none. */
export function variantImages(product: Product, variant: ProductVariant | undefined): ProductImage[] {
  return variant?.images.length ? variant.images : product.images;
}

/** Lowest and highest price a customer would pay across the product's sizes. */
export function priceRange(product: Product) {
  const prices = product.variants.map(effectivePrice);
  if (!prices.length) return { min: effectivePrice(product), max: effectivePrice(product) };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
