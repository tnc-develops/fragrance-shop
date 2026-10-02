import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Mail, MapPin, Phone } from "lucide-react";
import { getAbout, getSettings } from "@/lib/data";
import { imageUrl } from "@/lib/format";
import { pageMetadata, snippet } from "@/lib/seo";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";

export async function generateMetadata(): Promise<Metadata> {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  return pageMetadata({
    settings,
    title: "About Us",
    description: snippet(about?.intro || `${settings.shopName} is an online perfume shop in Sri Lanka for original designer fragrances.`),
    path: "/about",
    images: [imageUrl(about?.heroImage)],
  });
}

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const hero = imageUrl(about?.heroImage);
  const whatsapp = whatsappLink(settings.whatsappNumber);

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal">
        {hero && <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/55 to-charcoal/20" />
        <div className="container-luxe relative py-20 text-ivory md:py-32">
          <nav className="eyebrow mb-5 text-ivory/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gold">About us</span>
          </nav>
          {about?.eyebrow && <p className="eyebrow mb-3 text-gold">{about.eyebrow}</p>}
          <h1 className="max-w-3xl font-serif text-5xl leading-tight font-light md:text-7xl">{about?.heading ?? "About us"}</h1>
          {about?.intro && <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/75 md:text-lg">{about.intro}</p>}
        </div>
      </section>

      {!about && (
        <section className="container-luxe py-24 text-center">
          <p className="font-serif text-3xl text-charcoal">Our story is on its way</p>
          <p className="mt-3 text-sm text-ink/60">Please check back shortly.</p>
        </section>
      )}

      {about?.sections.map((section, i) => {
        const src = imageUrl(section.image);
        return (
          <section key={i} className={i % 2 ? "bg-cream" : "bg-ivory"}>
            <div className={clsx("container-luxe grid items-center gap-10 py-16 md:py-24", src && "lg:grid-cols-2 lg:gap-20")}>
              {src && (
                <div className={clsx("relative aspect-[4/5] overflow-hidden sm:aspect-[4/3] lg:aspect-[4/5]", i % 2 && "lg:order-2")}>
                  <Image src={src} alt={section.title} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                </div>
              )}
              <div className={clsx("max-w-xl", !src && "mx-auto text-center")}>
                <p className="eyebrow mb-4 text-gold">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="font-serif text-4xl leading-tight font-light text-charcoal md:text-5xl">{section.title}</h2>
                <span className={clsx("my-7 block h-px w-16 bg-gold", !src && "mx-auto")} />
                <div className="space-y-4 text-sm leading-relaxed text-ink/75 md:text-base">
                  {paragraphs(section.body).map((p, j) => (
                    <p key={j} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {about && about.values.length > 0 && (
        <section className="border-y border-sand bg-ivory">
          <div className="container-luxe py-16 md:py-20">
            <p className="eyebrow mb-10 text-center text-taupe">What we stand for</p>
            <div className={clsx("grid gap-6 sm:grid-cols-2", about.values.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
              {about.values.map((value, i) => (
                <div key={i} className="border border-sand bg-cream p-7 text-center">
                  <h3 className="font-serif text-2xl text-charcoal">{value.title}</h3>
                  <span className="mx-auto my-4 block h-px w-10 bg-gold" />
                  <p className="text-sm leading-relaxed text-ink/65">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(settings.address || settings.contactPhone || settings.contactEmail) && (
        <section className="bg-cream">
          <div className="container-luxe flex flex-col items-center gap-6 py-14 text-center md:flex-row md:justify-center md:gap-14">
            {settings.address && (
              <p className="flex items-center gap-3 text-sm text-ink">
                <MapPin size={18} className="text-gold" /> {settings.address}
              </p>
            )}
            {settings.contactPhone && (
              <a href={telLink(settings.contactPhone)} className="flex items-center gap-3 text-sm text-ink hover:text-gold">
                <Phone size={18} className="text-gold" /> {settings.contactPhone}
              </a>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-ink hover:text-gold">
                <WhatsappIcon size={18} className="text-gold" /> WhatsApp
              </a>
            )}
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 text-sm text-ink hover:text-gold">
                <Mail size={18} className="text-gold" /> {settings.contactEmail}
              </a>
            )}
          </div>
        </section>
      )}

      {about?.ctaHeading && (
        <section className="border-b border-ivory/10 bg-charcoal text-ivory">
          <div className="container-luxe flex flex-col items-center gap-8 py-20 text-center">
            <h2 className="max-w-2xl font-serif text-4xl font-light md:text-5xl">{about.ctaHeading}</h2>
            {about.ctaLabel && (
              <Link href={about.ctaLink || "/shop"} className="btn-light">
                {about.ctaLabel}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}
