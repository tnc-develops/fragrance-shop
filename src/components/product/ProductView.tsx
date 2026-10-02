"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { GENDER_LABEL } from "@/lib/format";
import { defaultVariant, variantImages, variantLabel, variantQuery } from "@/lib/variants";
import { Price } from "@/components/ui/Price";
import { Detail } from "./Detail";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchase } from "./ProductPurchase";
import { SizeSelector } from "./SizeSelector";

interface Props {
  product: Product;
  initialVariantId?: number;
  /** Brand, name and rating (rendered on the server). */
  header: React.ReactNode;
  /** Accordions shown after the description, e.g. notes and delivery. */
  details: React.ReactNode;
}

/** Product gallery and buying panel; price, photos, descriptions and stock follow the chosen size. */
export function ProductView({ product, initialVariantId, header, details }: Props) {
  const [selectedId, setSelectedId] = useState(
    () => product.variants.find((v) => v.id === initialVariantId)?.id ?? defaultVariant(product)?.id,
  );
  const variant = product.variants.find((v) => v.id === selectedId);

  const images = variantImages(product, variant);
  const shortDescription = variant?.shortDescription || product.shortDescription;
  const description = variant?.description || product.description;
  const size = variant ? variantLabel(variant) : null;
  const facts = [product.concentration, size, GENDER_LABEL[product.gender]].filter(Boolean) as string[];

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <ProductGallery key={variant?.id} images={images} name={size ? `${product.name} ${size}` : product.name} />
      </div>

      <div>
        {header}

        <div className="mt-6">
          <Price price={variant?.price ?? product.price} salePrice={variant ? variant.salePrice : product.salePrice} size="lg" />
        </div>

        {shortDescription && <p className="mt-6 font-serif text-xl leading-relaxed text-ink/80 italic">{shortDescription}</p>}

        {facts.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {facts.map((f) => (
              <span key={f} className="border border-sand bg-cream px-3 py-1.5 text-[11px] tracking-[0.15em] text-ink uppercase">
                {f}
              </span>
            ))}
          </div>
        )}

        {product.variants.length > 1 && (
          <div className="mt-8">
            <SizeSelector
              variants={product.variants}
              selectedId={selectedId}
              onSelect={(v) => {
                setSelectedId(v.id);
                window.history.replaceState(null, "", `?${variantQuery(product, v)}`);
              }}
            />
          </div>
        )}

        <div className="mt-8">
          <ProductPurchase key={variant?.id} product={product} variant={variant} />
        </div>

        <div className="mt-10 border-t border-sand">
          {description && (
            <Detail title="Description" open>
              <p className="whitespace-pre-line">{description}</p>
            </Detail>
          )}
          {details}
        </div>
      </div>
    </div>
  );
}
