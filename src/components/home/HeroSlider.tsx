"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/types";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

interface Props {
  slides: HeroSlide[];
  shopName: string;
  tagline: string | null;
  intervalMs: number;
}

export function HeroSlider({ slides, shopName, tagline, intervalMs }: Props) {
  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((index: number) => setActive(((index % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const timer = setTimeout(() => go(active + 1), intervalMs);
    return () => clearTimeout(timer);
  }, [active, count, intervalMs, go]);

  const [main, by] = shopName.split(/\s+(?=by\s)/i);
  const slide = slides[active];

  return (
    <section
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-charcoal"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={clsx(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
            i === active ? "z-10 opacity-100" : "z-0 opacity-0",
          )}
          aria-hidden={i !== active}
        >
          <div key={i === active ? `on-${active}` : "off"} className={clsx("absolute inset-0", i === active && "animate-ken-burns")}>
            <ResponsiveImage desktop={s.imageDesktop} mobile={s.imageMobile} alt={s.heading ?? shopName} eager={i === 0} quality={85} />
          </div>
        </div>
      ))}

      {/* Left-weighted scrim keeps the copy legible without darkening the bottles on the right. */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-charcoal/55 via-charcoal/20 to-charcoal/50 md:bg-gradient-to-r md:from-charcoal/75 md:via-charcoal/35 md:to-transparent" />

      <div className="relative z-30 flex h-full items-start pt-36 md:items-center md:pt-20">
        <div className="container-luxe">
          <div key={active} className="max-w-xl text-ivory">
            {slide?.eyebrow && (
              <p className="eyebrow animate-fade-up mb-6 flex items-center gap-3 text-gold">
                <span className="h-px w-10 bg-gold" />
                {slide.eyebrow}
              </p>
            )}
            <h1 className="animate-fade-up font-serif leading-[0.95] font-light [animation-delay:120ms]">
              <span className="block text-6xl tracking-wide sm:text-7xl lg:text-8xl">{main}</span>
              {by && <span className="mt-2 block text-4xl text-gold italic sm:text-5xl lg:text-6xl">{by}</span>}
            </h1>
            {(slide?.heading || tagline) && (
              <p className="animate-fade-up mt-7 font-serif text-2xl text-ivory/95 italic [animation-delay:240ms] sm:text-3xl">
                {slide?.heading ?? tagline}
              </p>
            )}
            {slide?.subheading && (
              <p className="animate-fade-up mt-4 max-w-md text-sm leading-relaxed text-ivory/75 [animation-delay:360ms] sm:text-base">
                {slide.subheading}
              </p>
            )}
            <div className="animate-fade-up mt-10 flex flex-wrap gap-4 [animation-delay:480ms]">
              <Link href={slide?.ctaLink || "/shop"} className="btn-primary group">
                {slide?.ctaLabel || "Shop the collection"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="#collections" className="btn-light hidden sm:inline-flex">
                Discover collections
              </Link>
            </div>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-30">
          <div className="container-luxe flex items-center justify-between">
            <div className="flex items-center gap-4">
              {slides.map((s, i) => (
                <button key={s.id} onClick={() => go(i)} className="group flex items-center gap-3 py-2" aria-label={`Go to slide ${i + 1}`}>
                  <span className={clsx("text-xs tabular-nums transition-colors", i === active ? "text-gold" : "text-ivory/50 group-hover:text-ivory")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative block h-px w-10 overflow-hidden bg-ivory/30 sm:w-16">
                    {i === active && (
                      <span
                        key={active}
                        className="animate-progress absolute inset-0 origin-left bg-gold"
                        style={{ animationDuration: `${intervalMs}ms` }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="hidden gap-2 md:flex">
              <button onClick={() => go(active - 1)} className="flex h-11 w-11 items-center justify-center border border-ivory/30 text-ivory transition-colors hover:border-gold hover:bg-gold hover:text-charcoal" aria-label="Previous slide">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => go(active + 1)} className="flex h-11 w-11 items-center justify-center border border-ivory/30 text-ivory transition-colors hover:border-gold hover:bg-gold hover:text-charcoal" aria-label="Next slide">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
