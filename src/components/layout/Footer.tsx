import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Category, ShopSettings } from "@/lib/types";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { Logo } from "./Logo";

function SocialIcon({ href, label, path }: { href: string; label: string; path: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border border-ivory/20 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  );
}

const INSTAGRAM =
  "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.1a6.7 6.7 0 100 13.4 6.7 6.7 0 000-13.4zm0 11a4.3 4.3 0 110-8.6 4.3 4.3 0 010 8.6zm6.9-11.3a1.6 1.6 0 11-3.1 0 1.6 1.6 0 013.1 0z";
const FACEBOOK =
  "M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z";

export function Footer({ settings, categories }: { settings: ShopSettings; categories: Category[] }) {
  const year = new Date().getFullYear();
  const whatsapp = whatsappLink(settings.whatsappNumber);

  return (
    <footer className="mt-auto bg-charcoal text-ivory/80">
      <div className="container-luxe grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <div className="inline-block">
            <Logo
              shopName={settings.shopName}
              logoLightUrl={settings.logoLightUrl}
              logoDarkUrl={settings.logoDarkUrl}
              onDark
              imageClassName="h-28"
            />
          </div>
          {settings.tagline && <p className="max-w-xs font-serif text-lg text-ivory/70 italic">{settings.tagline}</p>}
          <div className="flex gap-3">
            {settings.instagramUrl && <SocialIcon href={settings.instagramUrl} label="Instagram" path={INSTAGRAM} />}
            {settings.facebookUrl && <SocialIcon href={settings.facebookUrl} label="Facebook" path={FACEBOOK} />}
          </div>
        </div>

        <div>
          <h3 className="eyebrow mb-5 text-gold">Collections</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/shop" className="transition-colors hover:text-gold">
                Shop all
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.slug}`} className="transition-colors hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-5 text-gold">Explore</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/offers" className="transition-colors hover:text-gold">
                Offers
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-gold">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-gold">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition-colors hover:text-gold">
                My account
              </Link>
            </li>
            <li>
              <Link href="/track" className="transition-colors hover:text-gold">
                Track your order
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-gold">
                Shopping bag
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-5 text-gold">Visit &amp; contact</h3>
          <ul className="space-y-4 text-sm">
            {settings.address && (
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                {settings.address}
              </li>
            )}
            {settings.contactPhone && (
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
                <a href={telLink(settings.contactPhone)} className="hover:text-gold">
                  {settings.contactPhone}
                </a>
              </li>
            )}
            {whatsapp && (
              <li className="flex gap-3">
                <WhatsappIcon size={16} className="mt-0.5 shrink-0 text-gold" />
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  WhatsApp {settings.whatsappNumber}
                </a>
              </li>
            )}
            {settings.openingHours && (
              <li className="flex gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-gold" />
                {settings.openingHours}
              </li>
            )}
            {settings.contactEmail && (
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-gold">
                  {settings.contactEmail}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-6 text-xs text-ivory/50 sm:flex-row">
          <p>
            &copy; {year} {settings.shopName}. All rights reserved.
          </p>
          <p>Island-wide delivery across Sri Lanka. Cash on delivery or bank transfer.</p>
        </div>
      </div>
    </footer>
  );
}
