import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  return {
    name: settings.shopName,
    short_name: settings.shopName.split(/\s+by\s+/i)[0] || settings.shopName,
    description: settings.metaDescription ?? settings.tagline ?? undefined,
    start_url: "/",
    display: "standalone",
    background_color: settings.colors.ivory,
    theme_color: settings.colors.ivory,
    lang: "en-LK",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
