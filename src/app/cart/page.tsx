import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your bag", robots: { index: false, follow: true } };

export default function CartPage() {
  return (
    <>
      <PageIntro title="Your Bag" crumbs={[{ label: "Bag" }]} />
      <section className="container-luxe py-12 md:py-16">
        <CartView />
      </section>
    </>
  );
}
