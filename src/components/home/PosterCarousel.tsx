"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Poster } from "@/lib/types";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

const INTERVAL = 6000;

export function PosterCarousel({ posters }: { posters: Poster[] }) {
  const [active, setActive] = useState(0);
  const count = posters.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setTimeout(() => setActive((a) => (a + 1) % count), INTERVAL);
    return () => clearTimeout(timer);
  }, [active, count]);

  if (!count) return null;

  return (
    <section className="bg-ivory py-12 md:py-20" aria-label="Promotions">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8">
        {/* Desktop posters are ~3:1 and mobile posters ~1:2, matching the recommended upload sizes. */}
        <div className="relative aspect-[1440/2912] w-full overflow-hidden bg-mist shadow-[0_30px_60px_-40px_rgba(23,23,23,0.5)] md:aspect-[3584/1184]">
          {posters.map((p, i) => {
            const image = (
              <ResponsiveImage
                desktop={p.imageDesktop}
                mobile={p.imageMobile}
                alt={p.title ?? "Promotion"}
                sizes="(min-width: 1600px) 1600px, 100vw"
                className="transition-transform duration-[2000ms] group-hover:scale-[1.02]"
              />
            );
            return (
              <div
                key={p.id}
                className={clsx("absolute inset-0 transition-opacity duration-1000", i === active ? "z-10 opacity-100" : "z-0 opacity-0")}
                aria-hidden={i !== active}
              >
                {p.link ? (
                  <Link href={p.link} className="group absolute inset-0 block" tabIndex={i === active ? 0 : -1}>
                    {image}
                  </Link>
                ) : (
                  image
                )}
              </div>
            );
          })}
        </div>
        {count > 1 && (
          <div className="mt-6 flex justify-center gap-3">
            {posters.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                aria-label={`Show promotion ${i + 1}`}
                className={clsx("h-1.5 transition-all duration-500", i === active ? "w-10 bg-gold" : "w-4 bg-taupe/40 hover:bg-taupe")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
