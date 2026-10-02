import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function PageIntro({ title, description, crumbs = [] }: { title: string; description?: string; crumbs?: Crumb[] }) {
  return (
    <section className="border-b border-sand bg-mist/60">
      <div className="container-luxe py-10 md:py-14">
        <nav className="eyebrow mb-4 text-[10px] text-ink/50">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span className="mx-2">/</span>
              {c.href ? (
                <Link href={c.href} className="hover:text-gold">
                  {c.label}
                </Link>
              ) : (
                <span className="text-gold">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="font-serif text-4xl font-light text-charcoal md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm text-ink/60">{description}</p>}
      </div>
    </section>
  );
}
