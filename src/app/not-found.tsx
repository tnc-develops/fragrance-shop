import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-luxe flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <p className="eyebrow text-gold">404</p>
      <h1 className="font-serif text-5xl font-light text-charcoal">This scent has drifted away</h1>
      <p className="max-w-md text-sm text-ink/60">The page you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
      <div className="mt-4 flex gap-3">
        <Link href="/shop" className="btn-primary">
          Shop perfumes
        </Link>
        <Link href="/" className="btn-outline">
          Back home
        </Link>
      </div>
    </section>
  );
}
