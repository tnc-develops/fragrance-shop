import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getSettings } from "@/lib/data";
import { first, type SearchParams } from "@/lib/query";
import { pageMetadata } from "@/lib/seo";
import { ProductGrid } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/shop/SortSelect";
import { Pagination } from "@/components/shop/Pagination";

const PAGE_SIZE = 12;

export async function generateMetadata({ searchParams }: PageProps<"/offers">): Promise<Metadata> {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  const page = Math.max(1, Number(first(params.page)) || 1);
  return pageMetadata({
    settings,
    title: `Perfume Offers & Sale Prices in Sri Lanka${page > 1 ? ` (Page ${page})` : ""}`,
    description: `Discounted original perfumes in Sri Lanka at ${settings.shopName}. Limited-time sale prices on designer eau de parfum, with island-wide delivery and cash on delivery.`,
    path: page > 1 ? `/offers?page=${page}` : "/offers",
    keywords: ["perfume offers Sri Lanka", "perfume sale Sri Lanka", "discount perfumes Sri Lanka"],
  });
}

export default async function OffersPage({ searchParams }: PageProps<"/offers">) {
  const params: SearchParams = await searchParams;
  const result = await getProducts({
    onSale: "1",
    sort: first(params.sort),
    page: first(params.page),
    limit: String(PAGE_SIZE),
  });

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,166,107,0.28),transparent_55%)]" />
        <div className="container-luxe relative py-16 text-ivory md:py-24">
          <nav className="eyebrow mb-5 text-ivory/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gold">Offers</span>
          </nav>
          <p className="eyebrow mb-3 text-gold">Limited time</p>
          <h1 className="font-serif text-5xl font-light md:text-6xl">Offers</h1>
          <p className="mt-4 max-w-xl text-sm text-ivory/70 md:text-base">
            Signature scents at special prices. Offers run while stock lasts, so find your favourite before it is gone.
          </p>
        </div>
      </section>

      <section className="container-luxe py-12 md:py-16">
        {result.items.length ? (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-sand pb-5">
              <p className="text-sm text-ink/60">
                {result.total} {result.total === 1 ? "fragrance" : "fragrances"} on offer
              </p>
              <SortSelect params={params} />
            </div>
            <ProductGrid products={result.items} priorityCount={4} />
            <Pagination page={result.page} pages={result.pages} path="/offers" params={params} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 border border-dashed border-sand py-24 text-center">
            <p className="font-serif text-3xl text-charcoal">No offers right now</p>
            <p className="max-w-sm text-sm text-ink/60">New offers are added regularly. In the meantime, explore the full collection.</p>
            <Link href="/shop" className="btn-primary mt-4">
              Shop all perfumes
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
