"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { cartCount, useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useHydrated, useSettings } from "@/components/providers/SettingsProvider";
import { Logo } from "./Logo";

interface NavLink {
  label: string;
  href: string;
}

export function Header({ categories }: { categories: Pick<Category, "name" | "slug">[] }) {
  const settings = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.lines));
  const openCart = useCart((s) => s.open);
  const user = useAuth((s) => s.user);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const links: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Offers", href: "/offers" },
    { label: "About us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const isHome = pathname === "/";
  const solid = scrolled || !isHome || menuOpen || searchOpen;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {settings.announcement && (
          <div className="flex h-8 items-center justify-center bg-charcoal px-4 text-center text-[10px] tracking-[0.25em] text-ivory/90 uppercase sm:text-[11px]">
            <span className="truncate">{settings.announcement}</span>
          </div>
        )}

        <div
          className={clsx(
            "border-b transition-all duration-500",
            solid ? "border-sand bg-ivory/95 shadow-[0_8px_30px_-20px_rgba(23,23,23,0.35)] backdrop-blur-md" : "border-transparent bg-ivory/70 backdrop-blur-sm",
          )}
        >
          <div className="container-luxe grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
            <div className="flex items-center gap-1">
              <button
                className="-ml-2 p-2 text-ink transition-colors hover:text-gold lg:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </button>
              <nav className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Main">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={clsx(
                      "link-underline eyebrow transition-colors hover:text-gold",
                      isActive(l.href) ? "font-semibold text-charcoal after:scale-x-100!" : "text-ink",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <Logo shopName={settings.shopName} logoLightUrl={settings.logoLightUrl} logoDarkUrl={settings.logoDarkUrl} />

            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 text-ink transition-colors hover:text-gold"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <Link
                href="/account"
                className="hidden p-2 text-ink transition-colors hover:text-gold sm:block"
                aria-label={hydrated && user ? `Account (${user.name})` : "Sign in"}
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
              <button onClick={openCart} className="relative -mr-2 p-2 text-ink transition-colors hover:text-gold" aria-label="Open bag">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {hydrated && count > 0 && (
                  <span className="absolute top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-charcoal">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={submitSearch} className="animate-fade-up border-t border-sand">
              <div className="container-luxe flex items-center gap-3 py-4">
                <Search size={18} className="text-taupe" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search perfumes, brands, notes..."
                  className="flex-1 bg-transparent font-serif text-xl text-ink outline-none placeholder:text-taupe"
                />
                <button type="submit" className="eyebrow text-ink hover:text-gold">
                  Search
                </button>
              </div>
            </form>
          )}
        </div>
      </header>

      <div
        className={clsx(
          "fixed inset-0 z-40 bg-charcoal/40 transition-opacity duration-500 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-40 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-ivory pt-28 transition-transform duration-500 ease-[var(--ease-luxe)] lg:hidden",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col px-8" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={clsx("border-b border-sand py-4 font-serif text-2xl hover:text-gold", isActive(l.href) ? "text-gold" : "text-charcoal")}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {categories.length > 0 && (
          <div className="mt-8 px-8">
            <p className="eyebrow mb-3 text-taupe">Collections</p>
            <div className="flex flex-col gap-2.5">
              {categories.slice(0, 6).map((c) => (
                <Link key={c.slug} href={`/shop?category=${c.slug}`} className="text-sm text-ink hover:text-gold">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-auto flex flex-col gap-3 px-8 pt-8 pb-10">
          <Link href="/account" className="eyebrow text-ink hover:text-gold">
            {hydrated && user ? `My account (${user.name})` : "Sign in / Register"}
          </Link>
          <Link href="/track" className="eyebrow text-ink hover:text-gold">
            Track an order
          </Link>
        </div>
      </aside>
    </>
  );
}

export function HeaderSpacer({ hasAnnouncement }: { hasAnnouncement: boolean }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <div className={hasAnnouncement ? "h-24 md:h-28" : "h-16 md:h-20"} aria-hidden />;
}
