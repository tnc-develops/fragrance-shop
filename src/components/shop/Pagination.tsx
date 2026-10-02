import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { hrefWith, type SearchParams } from "@/lib/query";

export function Pagination({ page, pages, path, params }: { page: number; pages: number; path: string; params: SearchParams }) {
  if (pages <= 1) return null;
  const href = (p: number) => hrefWith(path, params, { page: p === 1 ? null : String(p) });
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);

  const cell = "flex h-10 min-w-10 items-center justify-center border px-3 text-sm transition-colors";

  return (
    <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link href={href(page - 1)} className={clsx(cell, "border-sand hover:border-gold hover:text-gold")} aria-label="Previous page">
          <ChevronLeft size={16} />
        </Link>
      )}
      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="text-taupe">...</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={clsx(cell, n === page ? "border-espresso bg-espresso text-ivory" : "border-sand hover:border-gold hover:text-gold")}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={clsx(cell, "border-sand hover:border-gold hover:text-gold")} aria-label="Next page">
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
