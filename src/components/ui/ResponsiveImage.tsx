import { getImageProps } from "next/image";
import clsx from "clsx";
import { imageUrl } from "@/lib/format";

interface Props {
  desktop: string;
  mobile?: string | null;
  alt: string;
  className?: string;
  /** Load immediately with high priority (use for the first hero slide only). */
  eager?: boolean;
  sizes?: string;
  quality?: number;
  breakpoint?: number;
}

/**
 * Art-directed image: phones download only the mobile crop, larger screens only
 * the desktop one. Fills its positioned parent.
 */
export function ResponsiveImage({
  desktop,
  mobile,
  alt,
  className,
  eager = false,
  sizes = "100vw",
  quality = 75,
  breakpoint = 768,
}: Props) {
  const common = {
    alt,
    fill: true,
    sizes,
    quality,
    ...(eager ? { loading: "eager" as const, fetchPriority: "high" as const } : {}),
  };
  const desktopSrc = imageUrl(desktop)!;
  const mobileSrc = imageUrl(mobile) ?? desktopSrc;

  const { props: desktopProps } = getImageProps({ ...common, src: desktopSrc });
  const { props: mobileProps } = getImageProps({ ...common, src: mobileSrc });

  return (
    <picture>
      <source media={`(min-width: ${breakpoint}px)`} srcSet={desktopProps.srcSet} sizes={desktopProps.sizes} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through mobileProps */}
      <img {...mobileProps} className={clsx("object-cover", className)} />
    </picture>
  );
}
