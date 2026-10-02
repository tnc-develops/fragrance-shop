import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { first, hrefWith, type SearchParams } from "@/lib/query";
import { GENDER_LABEL, imageUrl } from "@/lib/format";
import { breadcrumbJsonLd, GENDER_SEO, pageMetadata, snippet } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductGrid } from "@/components/product/ProductCard";
import { ShopFiltersMobile, ShopFiltersSidebar } from "@/components/shop/ShopFilters";
import { SortSelect } from "@/components/shop/SortSelect";
import { Pagination } from "@/components/shop/Pagination";

const PAGE_SIZE = 12;

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const params = await searchParams;
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const slug = first(params.category);
  const category = slug ? categories.find((c) => c.slug === slug) : undefined;
  const genderKey = first(params.gender) as keyof typeof GENDER_SEO | undefined;
  const gender = genderKey && GENDER_SEO[genderKey] ? genderKey : undefined;
  const page = Math.max(1, Number(first(params.page)) || 1);
  const search = first(params.search)?.trim();

  // Only the collection, gender and page change what's listed; sort and price filters share one canonical URL.
  const canonical = new URLSearchParams();
  if (category) canonical.set("category", category.slug);
  if (gender) canonical.set("gender", gender);
  if (page > 1) canonical.set("page", String(page));
  const path = `/shop${canonical.size ? `?${canonical}` : ""}`;

  let title: string = "Shop All Perfumes Online in Sri Lanka";
  if (category && gender) title = `${category.name} ${GENDER_SEO[gender].title}`;
  else if (category) title = `${category.name} | Perfumes in Sri Lanka`;
  else if (gender) title = GENDER_SEO[gender].title;
  if (page > 1) title += ` (Page ${page})`;
  if (search) title = `Search results for "${search.slice(0, 60)}"`;

  const description = snippet(
    category?.description
      ? `${category.description} Shop ${category.name.toLowerCase()} perfumes online in Sri Lanka with island-wide delivery and cash on delivery.`
      : gender
        ? `Shop original perfumes ${GENDER_SEO[gender].phrase} online in Sri Lanka. Compare eau de parfum sizes and prices in ${settings.currency}, with island-wide delivery and cash on delivery.`
        : `Shop original perfumes and fragrances online in Sri Lanka. Designer eau de parfum for men and women, prices in ${settings.currency}, island-wide delivery and cash on delivery.`,
  );

  return pageMetadata({
    settings,
    title,
    description,
    path,
    images: [imageUrl(category?.image)],
    keywords: [category ? `${category.name} perfumes Sri Lanka` : null, gender ? GENDER_SEO[gender].title : null, "perfume shop Sri Lanka"],
    noindex: Boolean(search),
  });
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params: SearchParams = await searchParams;
  const categorySlug = first(params.category);
  const search = first(params.search);

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      category: categorySlug,
      search,
      gender: first(params.gender),
      minPrice: first(params.minPrice),
      maxPrice: first(params.maxPrice),
      inStock: first(params.inStock),
      onSale: first(params.onSale),
      sort: first(params.sort),
      page: first(params.page),
      limit: String(PAGE_SIZE),
    }),
  ]);

  const category = categories.find((c) => c.slug === categorySlug);
  const banner = imageUrl(category?.image);
  const gender = first(params.gender) as keyof typeof GENDER_LABEL | undefined;
  const genderTitle = gender && GENDER_SEO[gender] ? GENDER_SEO[gender].title.replace(" in Sri Lanka", "") : null;
  const title = search ? `Results for "${search}"` : (category?.name ?? genderTitle ?? "All Perfumes");

  const chips: { label: string; remove: Record<string, null> }[] = [];
  if (category) chips.push({ label: category.name, remove: { category: null } });
  if (search) chips.push({ label: `"${search}"`, remove: { search: null } });
  if (gender && GENDER_LABEL[gender]) chips.push({ label: GENDER_LABEL[gender], remove: { gender: null } });
  if (first(params.minPrice) || first(params.maxPrice)) {
    chips.push({ label: `Price ${first(params.minPrice) ?? 0} - ${first(params.maxPrice) ?? "any"}`, remove: { minPrice: null, maxPrice: null } });
  }
  if (first(params.inStock)) chips.push({ label: "In stock", remove: { inStock: null } });
  if (first(params.onSale)) chips.push({ label: "On sale", remove: { onSale: null } });

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(category ? [{ name: category.name, path: `/shop?category=${category.slug}` }] : []),
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <section className="relative overflow-hidden bg-charcoal">
        {banner && <Image src={banner} alt="" fill sizes="100vw" className="object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 to-charcoal/30" />
        <div className="container-luxe relative py-16 text-ivory md:py-24">
          <nav className="eyebrow mb-5 text-ivory/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gold">Shop</span>
          </nav>
          <h1 className="font-serif text-5xl font-light md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-xl text-sm text-ivory/70 md:text-base">
            {category?.description ?? "Explore our curated wardrobe of eaux de parfum, attars and signature scents."}
          </p>
        </div>
      </section>

      <section className="container-luxe py-12 md:py-16">
        <div className="flex gap-12">
          <ShopFiltersSidebar categories={categories} params={params} />

          <div className="min-w-0 flex-1">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-sand pb-5 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <ShopFiltersMobile categories={categories} params={params} />
                <p className="text-xs text-ink/60 sm:text-sm">
                  {result.total} {result.total === 1 ? "fragrance" : "fragrances"}
                </p>
              </div>
              <SortSelect params={params} />
            </div>

            {chips.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={hrefWith("/shop", params, chip.remove)}
                    scroll={false}
                    className="inline-flex items-center gap-2 border border-sand bg-cream px-3 py-1.5 text-xs text-ink transition-colors hover:border-gold"
                  >
                    {chip.label}
                    <X size={12} />
                  </Link>
                ))}
                <Link href="/shop" className="eyebrow ml-2 text-[10px] text-taupe hover:text-gold">
                  Clear all
                </Link>
              </div>
            )}

            {result.items.length ? (
              <>
                <ProductGrid products={result.items} priorityCount={4} />
                <Pagination page={result.page} pages={result.pages} path="/shop" params={params} />
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 border border-dashed border-sand py-24 text-center">
                <p className="font-serif text-3xl text-charcoal">No fragrances found</p>
                <p className="max-w-sm text-sm text-ink/60">Try removing a filter or searching for a different note or brand.</p>
                <Link href="/shop" className="btn-primary mt-4">
                  View all perfumes
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
