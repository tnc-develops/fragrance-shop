"use client";

import { Gift } from "lucide-react";
import { usePrice, useSettings } from "@/components/providers/SettingsProvider";

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const settings = useSettings();
  const format = usePrice();
  const threshold = settings.freeShippingThreshold;
  if (!threshold) return null;

  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-xs text-ink/80">
        <Gift size={14} className="text-gold" />
        {remaining > 0 ? (
          <span>
            Spend <strong className="font-medium text-charcoal">{format(remaining)}</strong> more for free delivery and a
            complimentary gift
          </span>
        ) : (
          <span>You&apos;ve unlocked free delivery and a complimentary gift</span>
        )}
      </p>
      <div className="h-1 w-full overflow-hidden bg-sand">
        <div className="h-full bg-gold transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
