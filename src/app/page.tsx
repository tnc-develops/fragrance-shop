import type { Metadata } from "next";
import { getCategories, getHeroSlides, getPosters, getProducts, getSettings } from "@/lib/data";
import { imageUrl } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { HeroSlider } from "@/components/home/HeroSlider";
import { PosterCarousel } from "@/components/home/PosterCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ValueProps } from "@/components/home/ValueProps";
import { BrandStory } from "@/components/home/BrandStory";
import { SeoIntro } from "@/components/home/SeoIntro";
import { ProductGrid } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, slides] = await Promise.all([getSettings(), getHeroSlides()]);
  return pageMetadata({
    settings,
    title: { absolute: settings.seoTitle || `${settings.shopName} | Original Perfumes in Sri Lanka` },
    description: settings.metaDescription ?? settings.tagline ?? "",
    path: "/",
    images: [imageUrl(slides[0]?.imageDesktop) ?? imageUrl(settings.logoLightUrl)],
  });
}

export default async function HomePage() {
  const [settings, slides, posters, categories, featured, latest] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getPosters(),
    getCategories(),
    getProducts({ featured: "1", limit: "8", sort: "featured" }),
    getProducts({ limit: "4", sort: "newest" }),
  ]);

  const showcase = featured.items.length ? featured.items : latest.items;
  const storyImage = categories.find((c) => c.slug === "luxury")?.image ?? categories[0]?.image ?? null;

  return (
    <>
      {slides.length > 0 ? (
        <HeroSlider slides={slides} shopName={settings.shopName} tagline={settings.tagline} intervalMs={settings.heroIntervalMs} />
      ) : (
        <section className="flex min-h-[70vh] items-center bg-mist pt-28">
          <div className="container-luxe">
            <h1 className="font-serif text-6xl font-light text-charcoal md:text-8xl">{settings.shopName}</h1>
            {settings.tagline && <p className="mt-6 font-serif text-2xl text-ink/80 italic">{settings.tagline}</p>}
          </div>
        </section>
      )}

      <PosterCarousel posters={posters} />

      <CategoryGrid categories={categories} />

      {showcase.length > 0 && (
        <section className="bg-ivory py-20 md:py-28">
          <div className="container-luxe">
            <SectionHeading
              eyebrow="The edit"
              title="Signature favourites"
              description="Our most-loved fragrances, chosen for their beauty, longevity and unforgettable trail."
              action={{ label: "View all perfumes", href: "/shop" }}
              align="left"
            />
            <ProductGrid products={showcase} />
          </div>
        </section>
      )}

      <BrandStory shopName={settings.shopName} image={storyImage} />

      <SeoIntro settings={settings} categories={categories} />

      <ValueProps settings={settings} />
    </>
  );
}
