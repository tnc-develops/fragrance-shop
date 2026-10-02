import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/data";
import { imageUrl } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/offers"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...(["MEN", "WOMEN", "UNISEX"] as const).map((g) => ({
      url: absoluteUrl(`/shop?gender=${g}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
  ];

  const collections: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/shop?category=${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    ...(c.image ? { images: [imageUrl(c.image)!] } : {}),
  }));

  const items: MetadataRoute.Sitemap = products.map((p) => {
    const images = [...p.images, ...p.variants.flatMap((v) => v.images)]
      .map((i) => imageUrl(i.url))
      .filter((u, i, all): u is string => Boolean(u) && all.indexOf(u) === i)
      .slice(0, 10);
    return {
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: new Date(p.updatedAt ?? p.createdAt),
      changeFrequency: "weekly",
      priority: 0.7,
      ...(images.length ? { images } : {}),
    };
  });

  return [...pages, ...collections, ...items];
}
