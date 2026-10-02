"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-luxe flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <p className="eyebrow text-gold">Something went wrong</p>
      <h1 className="font-serif text-5xl font-light text-charcoal">A moment, please</h1>
      <p className="max-w-md text-sm text-ink/60">We couldn&apos;t load this page. Please try again in a moment.</p>
      <div className="mt-4 flex gap-3">
        <button onClick={() => retry()} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Back home
        </Link>
      </div>
    </section>
  );
}
