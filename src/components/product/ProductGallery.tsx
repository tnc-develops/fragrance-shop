"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { ProductImage } from "@/lib/types";
import { imageUrl } from "@/lib/format";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const current = images[active];
  const src = imageUrl(current?.url);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 md:w-20 md:flex-col">
          {images.map((img, i) => {
            const thumb = imageUrl(img.url);
            return (
              <button
                key={img.id}
                onClick={() => setActive(i)}
                className={clsx(
                  "relative aspect-square w-20 shrink-0 overflow-hidden border bg-white transition-colors",
                  i === active ? "border-gold" : "border-sand hover:border-taupe",
                )}
                aria-label={`Show image ${i + 1}`}
              >
                {thumb && <Image src={thumb} alt="" fill sizes="80px" className="object-contain p-1.5" />}
              </button>
            );
          })}
        </div>
      )}

      <div
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden border border-sand bg-white"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {src && (
          <Image
            key={src}
            src={src}
            alt={current?.alt ?? name}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            loading="eager"
            fetchPriority="high"
            quality={85}
            className="object-contain p-8 transition-transform duration-300 ease-out md:p-12"
            style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        )}
      </div>
    </div>
  );
}
