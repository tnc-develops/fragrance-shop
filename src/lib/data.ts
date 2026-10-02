import "server-only";
import { cache } from "react";
import { api, ApiError } from "./api";
import { FALLBACK_PAYMENT_OPTIONS } from "./payments";
import type { AboutPage, Category, HeroSlide, PaymentOption, Paginated, Poster, Product, ShopSettings } from "./types";

/** Catalog data is cached on the Next.js server and refreshed in the background. */
const REVALIDATE = 30;

export const FALLBACK_SETTINGS: ShopSettings = {
  shopName: "Fragrance by Shoon",
  tagline: "Signature scents, crafted to linger",
  logoLightUrl: null,
  logoDarkUrl: null,
  announcement: null,
  currency: "LKR",
  currencySymbol: "LKR",
  shippingFee: 0,
  freeShippingThreshold: null,
  heroIntervalMs: 5000,
  contactEmail: null,
  contactPhone: null,
  whatsappNumber: null,
  openingHours: null,
  address: null,
  instagramUrl: null,
  facebookUrl: null,
  metaDescription:
    "Buy original perfumes online in Sri Lanka. Luxury eau de parfum for men and women in LKR, island-wide delivery, cash on delivery or bank transfer.",
  seoTitle: "Original Perfumes in Sri Lanka | Fragrance by Shoon",
  seoKeywords: "perfume Sri Lanka, buy perfume online Sri Lanka, original perfumes Sri Lanka, luxury perfumes Sri Lanka",
  googleVerification: null,
  seoIntroHeading: null,
  seoIntroText: null,
  colors: {
    ivory: "#F4EFE7",
    charcoal: "#171717",
    gold: "#C9A66B",
    taupe: "#A99B89",
    text: "#24211E",
    espresso: "#30251F",
  },
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[storefront] API request failed:", err instanceof Error ? err.message : err);
    return fallback;
  }
}

export const getSettings = cache(() =>
  safe(
    async () => (await api<{ settings: ShopSettings }>("/settings", { revalidate: REVALIDATE })).settings,
    FALLBACK_SETTINGS,
  ),
);

/** Null when the backend is unreachable, so the page can show a friendly message. */
export const getAbout = () =>
  safe<AboutPage | null>(async () => (await api<{ about: AboutPage }>("/about", { revalidate: REVALIDATE })).about, null);

export const getPaymentOptions = () =>
  safe(async () => {
    const res = await api<{ items: PaymentOption[] }>("/payment-methods", { revalidate: 10 });
    return res.items.length ? res.items : FALLBACK_PAYMENT_OPTIONS;
  }, FALLBACK_PAYMENT_OPTIONS);

export const getHeroSlides = () =>
  safe(async () => (await api<{ items: HeroSlide[] }>("/hero", { revalidate: REVALIDATE })).items, []);

export const getPosters = () =>
  safe(async () => (await api<{ items: Poster[] }>("/posters", { revalidate: REVALIDATE })).items, []);

export const getCategories = cache(() =>
  safe(async () => (await api<{ items: Category[] }>("/categories", { revalidate: REVALIDATE })).items, []),
);

/** Cached responses from before sizes existed lack `variants`; treat them as having none until refreshed. */
const withVariants = (p: Product): Product => (Array.isArray(p.variants) ? p : { ...p, variants: [] });

export function getProducts(params: Record<string, string | undefined> = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => Boolean(e[1])),
  ).toString();
  return safe(
    async () => {
      const res = await api<Paginated<Product>>(`/products${qs ? `?${qs}` : ""}`, { revalidate: REVALIDATE });
      return { ...res, items: res.items.map(withVariants) };
    },
    { items: [], total: 0, page: 1, pages: 1 },
  );
}

/** Every active product, for the sitemap. Pages through the API's 100-per-request limit. */
export async function getAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await getProducts({ limit: "100", page: String(page), sort: "newest" });
    all.push(...res.items);
    if (page >= res.pages) break;
  }
  return all;
}

/** Returns null when the product does not exist (so the page can 404). */
export const getProduct = cache(async (slug: string) => {
  try {
    const res = await api<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`, {
      revalidate: REVALIDATE,
    });
    return { product: withVariants(res.product), related: res.related.map(withVariants) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
});
