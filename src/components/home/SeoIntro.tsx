import Link from "next/link";
import type { Category, ShopSettings } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Detail } from "@/components/product/Detail";

/** Descriptive copy and internal links that tell Google (and shoppers) what the shop sells and where. */
export function SeoIntro({ settings, categories }: { settings: ShopSettings; categories: Category[] }) {
  const paragraphs = (settings.seoIntroText ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!settings.seoIntroHeading && !paragraphs.length) return null;

  const links = [
    { label: "Men's perfumes", href: "/shop?gender=MEN" },
    { label: "Women's perfumes", href: "/shop?gender=WOMEN" },
    { label: "Unisex fragrances", href: "/shop?gender=UNISEX" },
    ...categories.map((c) => ({ label: c.name, href: `/shop?category=${c.slug}` })),
    { label: "Perfume offers", href: "/offers" },
  ];

  const faqs = [
    {
      q: "Are your perfumes original?",
      a: "Yes. Every fragrance is 100% authentic, sourced from the fragrance houses and authorised distributors.",
    },
    {
      q: "Do you deliver across Sri Lanka?",
      a: `We deliver island-wide.${settings.freeShippingThreshold ? ` Delivery is free on orders over ${formatPrice(settings.freeShippingThreshold, settings)}.` : ""}`,
    },
    { q: "How can I pay?", a: "Pay with cash on delivery, or by bank transfer and send us your payment slip online or on WhatsApp." },
    {
      q: "Can you help me choose a perfume?",
      a: "Of course. Contact us on WhatsApp and tell us the scents you love; we'll suggest notes, sizes and gift ideas.",
    },
  ];

  return (
    <section className="bg-cream py-16 md:py-24" aria-labelledby="seo-intro-heading">
      <div className="container-luxe grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-3 text-gold">Online perfume shop in Sri Lanka</p>
          <h2 id="seo-intro-heading" className="font-serif text-3xl leading-tight font-light text-charcoal md:text-4xl">
            {settings.seoIntroHeading ?? "Original perfumes in Sri Lanka"}
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/75 md:text-base">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <nav aria-label="Shop by collection" className="mt-8 flex flex-wrap gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border border-sand bg-ivory px-3 py-2 text-xs text-ink transition-colors hover:border-gold hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Questions, answered</h2>
          <div className="mt-4 border-t border-sand">
            {faqs.map((f) => (
              <Detail key={f.q} title={f.q}>
                <p>{f.a}</p>
              </Detail>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
