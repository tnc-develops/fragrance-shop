import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { imageUrl } from "@/lib/format";

interface LogoProps {
  shopName: string;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  /** Set when the logo sits on a dark background, so the dark-background logo is used. */
  onDark?: boolean;
  /** Size classes for the uploaded logo image. */
  imageClassName?: string;
}

/**
 * Shows the uploaded logo that suits the background (falling back to the other one),
 * or "Fragrance by Shoon" as a two-line wordmark when no logo is uploaded.
 */
export function Logo({ shopName, logoLightUrl, logoDarkUrl, onDark = false, imageClassName = "h-14 md:h-[4.5rem]" }: LogoProps) {
  const preferred = imageUrl(onDark ? logoDarkUrl : logoLightUrl);
  const logo = preferred ?? imageUrl(onDark ? logoLightUrl : logoDarkUrl);
  const [main, by] = shopName.split(/\s+(?=by\s)/i);

  return (
    <Link href="/" className="group flex flex-col items-center leading-none" aria-label={`${shopName} home`}>
      {logo ? (
        <Image
          src={logo}
          alt={shopName}
          width={240}
          height={280}
          priority={!onDark}
          className={clsx(
            "w-auto object-contain transition-opacity group-hover:opacity-85",
            // Flat logo backgrounds melt into the surface behind them.
            preferred && (onDark ? "mix-blend-lighten" : "mix-blend-darken"),
            imageClassName,
          )}
        />
      ) : (
        <>
          <span
            className={clsx(
              "font-serif text-2xl font-medium tracking-[0.08em] uppercase transition-colors md:text-[1.7rem]",
              onDark ? "text-ivory" : "text-charcoal",
              "group-hover:text-gold",
            )}
          >
            {main}
          </span>
          {by && (
            <span className={clsx("mt-1 text-[10px] font-semibold tracking-[0.45em] uppercase", onDark ? "text-gold" : "text-gold brightness-90")}>
              {by}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
