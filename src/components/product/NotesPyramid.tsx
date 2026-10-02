import type { Product } from "@/lib/types";

const TIERS = [
  { key: "topNotes", label: "Top notes", hint: "The first impression" },
  { key: "heartNotes", label: "Heart notes", hint: "The soul of the scent" },
  { key: "baseNotes", label: "Base notes", hint: "The lasting trail" },
] as const;

export function NotesPyramid({ product }: { product: Product }) {
  const tiers = TIERS.filter((t) => product[t.key]);
  if (!tiers.length) return null;

  return (
    <div className="space-y-4">
      {tiers.map((t, i) => (
        <div key={t.key} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 font-serif text-sm text-gold">
              {i + 1}
            </span>
            {i < tiers.length - 1 && <span className="mt-1 w-px flex-1 bg-sand" />}
          </div>
          <div className="pb-2">
            <p className="eyebrow text-charcoal">{t.label}</p>
            <p className="mt-0.5 text-[11px] text-taupe italic">{t.hint}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product[t.key]!.split(",").map((note) => (
                <span key={note} className="border border-sand bg-cream px-2.5 py-1 text-xs text-ink">
                  {note.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
