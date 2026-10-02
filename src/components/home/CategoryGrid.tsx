import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { imageUrl } from "@/lib/format";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section id="collections" className="scroll-mt-24 bg-cream py-20 md:py-28">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Curated collections"
          title="Find your signature"
          description="From luminous florals to deep, resinous woods - explore scents chosen for every mood and moment."
        />
      </div>
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {categories.map((c) => {
            const src = imageUrl(c.image);
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group relative aspect-[9/14] w-[62%] shrink-0 snap-start overflow-hidden bg-mist sm:w-auto"
              >
                {src && (
                  <Image
                    src={src}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 62vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-luxe)] group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent transition-opacity duration-500 group-hover:from-charcoal/90" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-serif text-2xl text-ivory">{c.name}</h3>
                  <p className="eyebrow mt-2 flex items-center gap-1.5 text-gold">
                    Discover
                    <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
