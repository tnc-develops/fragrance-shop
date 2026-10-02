import { ChevronDown } from "lucide-react";

export function Detail({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-sand">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        <span className="eyebrow text-charcoal">{title}</span>
        <ChevronDown size={16} className="text-taupe transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-ink/75">{children}</div>
    </details>
  );
}
