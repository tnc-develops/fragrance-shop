import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/format";

export function BrandStory({ shopName, image }: { shopName: string; image: string | null }) {
  const src = imageUrl(image);

  return (
    <section className="overflow-hidden bg-charcoal text-ivory">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[420px] lg:min-h-[640px]">
          {src && <Image src={src} alt={`${shopName} atelier`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-charcoal/40" />
        </div>
        <div className="flex items-center px-6 py-20 sm:px-12 lg:px-20">
          <div className="max-w-lg">
            <p className="eyebrow mb-5 text-gold">Our philosophy</p>
            <h2 className="font-serif text-4xl leading-tight font-light md:text-5xl">
              Scent is the most <span className="text-gold italic">intimate</span> accessory
            </h2>
            <span className="my-8 block h-px w-16 bg-gold" />
            <p className="text-sm leading-relaxed text-ivory/70 md:text-base">
              At {shopName}, every bottle is chosen for its character - the way it opens, the way it lingers, the memory it
              leaves behind. We curate perfumes, attars and home fragrance from houses that treat scent as an art form.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70 md:text-base">
              Whether you are discovering your first signature or adding to a cherished collection, we are here to help you
              find the one that feels unmistakably yours.
            </p>
            <Link href="/shop" className="btn-light mt-10">
              Explore the boutique
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
