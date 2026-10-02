import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getSettings } from "@/lib/data";
import { imageUrl } from "@/lib/format";
import { breadcrumbJsonLd, pageMetadata, productJsonLd, productSeo } from "@/lib/seo";
import { defaultVariant, findVariant, priceRange, variantImages } from "@/lib/variants";
import { JsonLd } from "@/components/seo/JsonLd";
import { Detail } from "@/components/product/Detail";
import { NotesPyramid } from "@/components/product/NotesPyramid";
import { ProductView } from "@/components/product/ProductView";
import { Reviews } from "@/components/product/Reviews";
import { ProductGrid } from "@/components/product/ProductCard";
import { StarRating } from "@/components/ui/StarRating";
import { SectionHeading } from "@/components/ui/SectionHeading";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [data, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!data) return { title: "Fragrance not found", robots: { index: false } };
  const { product } = data;
  const seo = productSeo(product, settings);
  const images = [
    ...variantImages(product, defaultVariant(product)),
    ...product.images,
  ].map((i) => imageUrl(i.url));
  const { min } = priceRange(product);
  const meta = pageMetadata({
    settings,
    title: seo.title,
    description: seo.description,
    path: `/product/${product.slug}`,
    images: [...new Set(images)].slice(0, 4),
    keywords: seo.keywords,
  });
  return {
    ...meta,
    other: {
      "product:price:amount": String(min),
      "product:price:currency": settings.currency,
      "product:availability": product.stock > 0 ? "in stock" : "out of stock",
      ...(product.brand ? { "product:brand": product.brand } : {}),
    },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/product/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [data, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!data) notFound();
  const { product, related } = data;
  const initial = findVariant(product, { size: first(query.size), variant: first(query.variant) });
  const seo = productSeo(product, settings);
  const category = product.categories[0];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(category ? [{ name: category.name, path: `/shop?category=${category.slug}` }] : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={[productJsonLd(product, settings, product.seoDescription?.trim() || product.shortDescription || seo.description), breadcrumbJsonLd(crumbs)]} />
      <div className="container-luxe py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="eyebrow mb-8 text-[10px] text-taupe">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-gold">
            Shop
          </Link>
          {product.categories[0] && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/shop?category=${product.categories[0].slug}`} className="hover:text-gold">
                {product.categories[0].name}
              </Link>
            </>
          )}
        </nav>

        <ProductView
          product={product}
          initialVariantId={initial?.id}
          header={
            <>
              {product.brand && <p className="eyebrow text-taupe">{product.brand}</p>}
              <h1 className="mt-3 font-serif text-4xl leading-tight font-light text-charcoal md:text-5xl">{product.name}</h1>
              {product.ratingCount > 0 && (
                <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-xs text-ink/60 hover:text-gold">
                  <StarRating value={product.ratingAvg} />
                  {product.ratingAvg.toFixed(1)} ({product.ratingCount} {product.ratingCount === 1 ? "review" : "reviews"})
                </a>
              )}
            </>
          }
          details={
            <>
              {(product.topNotes || product.heartNotes || product.baseNotes) && (
                <Detail title="Fragrance notes" open>
                  <NotesPyramid product={product} />
                </Detail>
              )}
              <Detail title="Delivery & returns">
                <p>
                  Orders are carefully packed and dispatched within 1-2 business days. Pay with cash when your order arrives.
                  Unopened items may be returned within 7 days of delivery.
                </p>
              </Detail>
            </>
          }
        />

        <Reviews productId={product.id} productSlug={product.slug} />
      </div>

      {related.length > 0 && (
        <section className="bg-cream py-16 md:py-24">
          <div className="container-luxe">
            <SectionHeading eyebrow="You may also love" title="Complete the ritual" />
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
