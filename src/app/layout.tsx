import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { getCategories, getHeroSlides, getSettings } from "@/lib/data";
import { imageUrl } from "@/lib/format";
import { COUNTRY, keywordList, SITE_URL, storeJsonLd, websiteJsonLd } from "@/lib/seo";
import type { ThemeColors } from "@/lib/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { CartSync } from "@/components/providers/CartSync";
import { Header, HeaderSpacer } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsappButton } from "@/components/layout/WhatsappButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "@/components/ui/Toaster";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, slides] = await Promise.all([getSettings(), getHeroSlides()]);
  const title = settings.seoTitle || `${settings.shopName} | Original Perfumes in Sri Lanka`;
  const description = settings.metaDescription ?? settings.tagline ?? undefined;
  const image = imageUrl(slides[0]?.imageDesktop) ?? imageUrl(settings.logoLightUrl);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${settings.shopName}` },
    description,
    keywords: keywordList(settings),
    applicationName: settings.shopName,
    authors: [{ name: settings.shopName, url: SITE_URL }],
    creator: settings.shopName,
    publisher: settings.shopName,
    category: "shopping",
    openGraph: {
      type: "website",
      locale: "en_LK",
      siteName: settings.shopName,
      title,
      description,
      url: "/",
      ...(image ? { images: [{ url: image, alt: settings.shopName }] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    ...(settings.googleVerification ? { verification: { google: settings.googleVerification } } : {}),
    other: { "geo.region": "LK", "geo.placename": settings.address ?? COUNTRY },
  };
}

export const viewport: Viewport = {
  themeColor: "#F4EFE7",
  width: "device-width",
  initialScale: 1,
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Applies the admin-configured palette by overriding the Tailwind theme variables. */
function themeVars(colors: ThemeColors): React.CSSProperties {
  const map: Record<string, string> = {
    "--color-ivory": colors.ivory,
    "--color-charcoal": colors.charcoal,
    "--color-gold": colors.gold,
    "--color-taupe": colors.taupe,
    "--color-ink": colors.text,
    "--color-espresso": colors.espresso,
  };
  return Object.fromEntries(Object.entries(map).filter(([, v]) => HEX.test(v ?? ""))) as React.CSSProperties;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <html lang="en-LK" className={`${serif.variable} ${sans.variable}`} style={themeVars(settings.colors)}>
      <body className="flex min-h-screen flex-col">
        <JsonLd data={[storeJsonLd(settings, categories), websiteJsonLd(settings)]} />
        <SettingsProvider settings={settings}>
          <Header categories={categories} />
          <HeaderSpacer hasAnnouncement={Boolean(settings.announcement)} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer settings={settings} categories={categories} />
          <WhatsappButton />
          <CartDrawer />
          <CartSync />
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
