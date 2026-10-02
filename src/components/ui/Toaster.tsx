"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/store/toast";

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div
            key={t.id}
            className="animate-fade-up pointer-events-auto flex w-full max-w-sm items-center gap-3 border border-gold/30 bg-charcoal px-4 py-3 text-sm text-ivory shadow-2xl"
          >
            <Icon size={18} className={clsx(t.tone === "error" ? "text-red-300" : "text-gold")} />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-ivory/60 hover:text-gold" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
