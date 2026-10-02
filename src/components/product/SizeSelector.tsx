"use client";

import clsx from "clsx";
import type { ProductVariant } from "@/lib/types";
import { effectivePrice } from "@/lib/format";
import { variantLabel } from "@/lib/variants";
import { usePrice } from "@/components/providers/SettingsProvider";

interface Props {
  variants: ProductVariant[];
  selectedId: number | undefined;
  onSelect: (variant: ProductVariant) => void;
}

export function SizeSelector({ variants, selectedId, onSelect }: Props) {
  const format = usePrice();
  const selected = variants.find((v) => v.id === selectedId);

  return (
    <fieldset>
      <legend className="eyebrow text-charcoal">
        Size
        {selected && <span className="ml-2 tracking-normal text-taupe normal-case">{variantLabel(selected)}</span>}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a size">
        {variants.map((v) => {
          const active = v.id === selectedId;
          const soldOut = v.stock <= 0;
          const price = effectivePrice(v);
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(v)}
              className={clsx(
                "min-w-24 border px-4 py-2.5 text-center transition-colors duration-300",
                active ? "border-espresso bg-espresso text-ivory" : "border-sand bg-cream text-charcoal hover:border-gold",
              )}
            >
              <span className={clsx("block font-serif text-lg leading-tight", soldOut && "line-through opacity-60")}>
                {variantLabel(v) ?? "Standard"}
              </span>
              <span
                className={clsx(
                  "mt-0.5 block text-[11px] tracking-wide",
                  active ? "text-ivory/75" : price < v.price ? "text-gold" : "text-taupe",
                )}
              >
                {soldOut ? "Sold out" : format(price)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
