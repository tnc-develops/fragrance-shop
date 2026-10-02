import type { Metadata } from "next";
import type { Category, Product, ShopSettings } from "./types";
import { effectivePrice, imageUrl } from "./format";
import { defaultVariant, priceRange, variantImages, variantLabel, variantQuery } from "./variants";

/** Public address of the storefront, used for canonical links, the sitemap and structured data. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export const COUNTRY = "Sri Lanka";

export function keywordList(settings: ShopSettings, extra: (string | null | undefined)[] = []): string[] {
  const base = (settings.seoKeywords ?? "").split(/[,\n]/);
  const seen = new Set<string>();
  return [...extra, ...base]
    .map((k) => k?.trim())
    .filter((k): k is string => {
      if (!k || seen.has(k.toLowerCase())) return false;
      seen.add(k.toLowerCase());
      return true;
    });
}

/** Trims to Google's snippet length on a word boundary. */
export function snippet(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max - 1)).replace(/[,.;:\s]+$/, "")}…`;
}

/** Joins whole sentences, skipping any that would push the text past `max`, so nothing is cut mid-phrase. */
export function fitSentences(sentences: (string | null | undefined)[], max = 160): string {
  const parts = sentences.map((s) => s?.replace(/\s+/g, " ").trim()).filter((s): s is string => Boolean(s));
  if (!parts.length) return "";
  if (parts[0].length > max) return snippet(parts[0], max);
  let out = parts[0];
  for (const part of parts.slice(1)) {
    if (out.length + 1 + part.length <= max) out = `${out} ${part}`;
  }
  return out;
}

interface PageMetaInput {
  settings: ShopSettings;
  title: string | { absolute: string };
  description: string;
  path: string;
  images?: (string | null | undefined)[];
  keywords?: (string | null | undefined)[];
  noindex?: boolean;
}

/**
 * Full metadata for a page. Next replaces (not merges) `openGraph` and `twitter` from the layout,
 * so every page builds the whole set here.
 */
export function pageMetadata({ settings, title, description, path, images = [], keywords, noindex }: PageMetaInput): Metadata {
  const plainTitle = typeof title === "string" ? `${title} | ${settings.shopName}` : title.absolute;
  const imgs = images.filter((i): i is string => Boolean(i));
  return {
    title,
    description,
    ...(keywords ? { keywords: keywordList(settings, keywords) } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_LK",
      siteName: settings.shopName,
      url: path,
      title: plainTitle,
      description,
      ...(imgs.length ? { images: imgs.map((url) => ({ url, alt: plainTitle })) } : {}),
    },
    twitter: {
      card: imgs.length ? "summary_large_image" : "summary",
      title: plainTitle,
      description,
      ...(imgs.length ? { images: imgs } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export const GENDER_SEO = {
  MEN: { title: "Men's Perfumes in Sri Lanka", phrase: "for men" },
  WOMEN: { title: "Women's Perfumes in Sri Lanka", phrase: "for women" },
  UNISEX: { title: "Unisex Fragrances in Sri Lanka", phrase: "unisex" },
} as const;

/** "Dior Sauvage Eau de Parfum" */
export function productFullName(product: Product): string {
  const name = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) ? `${product.brand} ${product.name}` : product.name;
  return product.concentration && !name.toLowerCase().includes(product.concentration.toLowerCase())
    ? `${name} ${product.concentration}`
    : name;
}

export function productSeo(product: Product, settings: ShopSettings) {
  const fullName = productFullName(product);
  const { min } = priceRange(product);
  const price = `${settings.currencySymbol} ${new Intl.NumberFormat("en-US").format(min)}`;
  const gender = GENDER_SEO[product.gender]?.phrase;
  const title = product.seoTitle?.trim() || `${fullName} Price in Sri Lanka`;
  const description =
    product.seoDescription?.trim() ||
    fitSentences([
      `Buy original ${fullName}${gender ? ` ${gender}` : ""} online in Sri Lanka from ${price}.`,
      "Island-wide delivery and cash on delivery.",
      product.shortDescription,
    ]);
  const notes = [product.topNotes, product.heartNotes, product.baseNotes]
    .flatMap((n) => (n ?? "").split(","))
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 6);
  const keywords = [
    `${product.name} price in Sri Lanka`,
    `${fullName} Sri Lanka`,
    product.brand ? `${product.brand} perfume Sri Lanka` : null,
    product.brand ? `${product.brand} ${product.name}` : null,
    gender === "for men" ? "men's perfume Sri Lanka" : gender === "for women" ? "women's perfume Sri Lanka" : "unisex perfume Sri Lanka",
    ...product.categories.map((c) => `${c.name} perfumes`),
    ...notes.map((n) => `${n} perfume`),
  ];
  return { title, description, keywords };
}

// ----- Structured data (schema.org JSON-LD) -----

type Json = Record<string, unknown>;

/** Social links that point at a real profile, not a placeholder like https://instagram.com/. */
function profileLinks(settings: ShopSettings): string[] {
  return [settings.instagramUrl, settings.facebookUrl].filter((u): u is string => {
    if (!u) return false;
    try {
      return new URL(u).pathname.replace(/\//g, "").length > 0;
    } catch {
      return false;
    }
  });
}

export function storeJsonLd(settings: ShopSettings, categories: Category[]): Json {
  const logo = imageUrl(settings.logoLightUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#store`,
    name: settings.shopName,
    url: SITE_URL,
    description: settings.metaDescription ?? settings.tagline ?? undefined,
    ...(logo ? { logo, image: logo } : {}),
    ...(settings.contactPhone ? { telephone: settings.contactPhone } : {}),
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    address: {
      "@type": "PostalAddress",
      ...(settings.address ? { streetAddress: settings.address } : {}),
      addressCountry: "LK",
    },
    areaServed: { "@type": "Country", name: COUNTRY },
    currenciesAccepted: settings.currency,
    paymentAccepted: "Cash on delivery, Bank transfer",
    priceRange: `${settings.currencySymbol}`,
    sameAs: profileLinks(settings),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Perfumes",
      itemListElement: categories.map((c) => ({
        "@type": "OfferCatalog",
        name: c.name,
        url: absoluteUrl(`/shop?category=${c.slug}`),
      })),
    },
  };
}

export function websiteJsonLd(settings: ShopSettings): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: settings.shopName,
    url: SITE_URL,
    inLanguage: "en-LK",
    publisher: { "@id": `${SITE_URL}/#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: Product, settings: ShopSettings, description: string): Json {
  const url = absoluteUrl(`/product/${product.slug}`);
  const images = [...product.images, ...product.variants.flatMap((v) => v.images)]
    .map((i) => imageUrl(i.url))
    .filter((u, i, all): u is string => Boolean(u) && all.indexOf(u) === i)
    .slice(0, 10);
  const main = defaultVariant(product);
  const fallbackImage = imageUrl(variantImages(product, main)[0]?.url);

  const shipping = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: settings.shippingFee, currency: settings.currency },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "LK" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 4, unitCode: "DAY" },
    },
  };
  const returns = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "LK",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
  };

  const offers = product.variants.map((v) => ({
    "@type": "Offer",
    url: `${url}?${variantQuery(product, v)}`,
    ...(v.sku ? { sku: v.sku } : {}),
    name: variantLabel(v) ?? product.name,
    price: effectivePrice(v),
    priceCurrency: settings.currency,
    availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": `${SITE_URL}/#store` },
    shippingDetails: shipping,
    hasMerchantReturnPolicy: returns,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: productFullName(product),
    description,
    url,
    image: images.length ? images : fallbackImage ? [fallbackImage] : undefined,
    ...(main?.sku ? { sku: main.sku } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
    audience: {
      "@type": "PeopleAudience",
      suggestedGender: product.gender === "MEN" ? "male" : product.gender === "WOMEN" ? "female" : "unisex",
    },
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.ratingAvg.toFixed(1)),
            reviewCount: product.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: offers.length === 1 ? offers[0] : offers,
  };
}
