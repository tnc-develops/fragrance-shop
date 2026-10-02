"use client";

import { Minus, Plus } from "lucide-react";
import clsx from "clsx";

interface Props {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, onChange, max = 99, min = 1, size = "md" }: Props) {
  const h = size === "sm" ? "h-8" : "h-12";
  const w = size === "sm" ? "w-8" : "w-11";
  return (
    <div className={clsx("inline-flex items-center border border-sand bg-cream", h)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={clsx("flex h-full items-center justify-center text-ink transition-colors hover:text-gold disabled:opacity-30", w)}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className={clsx("text-center text-sm tabular-nums", size === "sm" ? "w-7" : "w-10")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={clsx("flex h-full items-center justify-center text-ink transition-colors hover:text-gold disabled:opacity-30", w)}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
