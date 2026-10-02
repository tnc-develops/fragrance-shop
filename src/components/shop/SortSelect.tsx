"use client";

import { usePathname, useRouter } from "next/navigation";
import { hrefWith, type SearchParams, first } from "@/lib/query";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name A-Z" },
];

export function SortSelect({ params }: { params: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-3">
      <span className="eyebrow hidden text-ink/60 sm:inline">Sort by</span>
      <select
        aria-label="Sort by"
        value={first(params.sort) ?? "featured"}
        onChange={(e) => router.push(hrefWith(pathname, params, { sort: e.target.value === "featured" ? null : e.target.value }), { scroll: false })}
        className="w-36 cursor-pointer border border-sand bg-cream px-2.5 py-2.5 text-xs text-ink outline-none focus:border-gold sm:w-auto sm:px-3 sm:text-sm"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
