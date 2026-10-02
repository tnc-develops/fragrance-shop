"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { hrefWith, first, type SearchParams } from "@/lib/query";
import { useSettings } from "@/components/providers/SettingsProvider";

const GENDERS = [
  { value: "WOMEN", label: "For Her" },
  { value: "MEN", label: "For Him" },
  { value: "UNISEX", label: "Unisex" },
];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-sand py-6 first:pt-0">
      <h3 className="eyebrow mb-4 text-charcoal">{title}</h3>
      {children}
    </div>
  );
}

function Option({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={clsx(
        "flex items-center gap-3 py-1.5 text-sm transition-colors",
        active ? "text-charcoal" : "text-ink/65 hover:text-gold",
      )}
    >
      <span className={clsx("h-3.5 w-3.5 shrink-0 border transition-colors", active ? "border-gold bg-gold" : "border-taupe/60")} />
      {children}
    </Link>
  );
}

function FilterPanel({ categories, params }: { categories: Category[]; params: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const settings = useSettings();
  const minParam = first(params.minPrice) ?? "";
  const maxParam = first(params.maxPrice) ?? "";
  const [min, setMin] = useState(minParam);
  const [max, setMax] = useState(maxParam);
  const [synced, setSynced] = useState(`${minParam}-${maxParam}`);
  if (synced !== `${minParam}-${maxParam}`) {
    setSynced(`${minParam}-${maxParam}`);
    setMin(minParam);
    setMax(maxParam);
  }

  const category = first(params.category);
  const gender = first(params.gender);
  const href = (changes: Record<string, string | null>) => hrefWith(pathname, params, changes);

  return (
    <div>
      <FilterGroup title="Collection">
        <Option href={href({ category: null })} active={!category}>
          All perfumes
        </Option>
        {categories.map((c) => (
          <Option key={c.id} href={href({ category: category === c.slug ? null : c.slug })} active={category === c.slug}>
            <span className="flex-1">{c.name}</span>
            {c.productCount !== undefined && <span className="text-xs text-taupe">{c.productCount}</span>}
          </Option>
        ))}
      </FilterGroup>

      <FilterGroup title="For">
        {GENDERS.map((g) => (
          <Option key={g.value} href={href({ gender: gender === g.value ? null : g.value })} active={gender === g.value}>
            {g.label}
          </Option>
        ))}
      </FilterGroup>

      <FilterGroup title={`Price (${settings.currencySymbol})`}>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(href({ minPrice: min, maxPrice: max }), { scroll: false });
          }}
        >
          <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Min" className="input px-3 py-2" aria-label="Minimum price" />
          <span className="text-taupe">-</span>
          <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Max" className="input px-3 py-2" aria-label="Maximum price" />
          <button type="submit" className="btn-primary px-4 py-2.5">
            Go
          </button>
        </form>
      </FilterGroup>

      <FilterGroup title="Availability">
        <Option href={href({ inStock: first(params.inStock) ? null : "1" })} active={Boolean(first(params.inStock))}>
          In stock only
        </Option>
        <Option href={href({ onSale: first(params.onSale) ? null : "1" })} active={Boolean(first(params.onSale))}>
          On sale
        </Option>
      </FilterGroup>
    </div>
  );
}

export function ShopFiltersSidebar({ categories, params }: { categories: Category[]; params: SearchParams }) {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <FilterPanel categories={categories} params={params} />
    </aside>
  );
}

export function ShopFiltersMobile({ categories, params }: { categories: Category[]; params: SearchParams }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const paramsKey = JSON.stringify(params);
  const [lastParams, setLastParams] = useState(paramsKey);
  if (paramsKey !== lastParams) {
    setLastParams(paramsKey);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline px-4 py-2.5 lg:hidden">
        <SlidersHorizontal size={14} /> Filters
      </button>

      <div
        className={clsx("fixed inset-0 z-[60] bg-charcoal/50 transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
      />
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-[61] flex w-[88%] max-w-sm flex-col bg-ivory transition-transform duration-500 ease-[var(--ease-luxe)] lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <h2 className="font-serif text-2xl">Filters</h2>
          <button onClick={() => setOpen(false)} aria-label="Close filters" className="p-1 hover:text-gold">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FilterPanel categories={categories} params={params} />
        </div>
        <div className="border-t border-sand p-6">
          <Link href={pathname} className="btn-outline w-full">
            Clear all
          </Link>
        </div>
      </div>
    </>
  );
}
