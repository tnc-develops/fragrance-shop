import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getPaymentOptions } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const paymentOptions = await getPaymentOptions();
  return (
    <>
      <PageIntro title="Checkout" crumbs={[{ label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
      <section className="container-luxe py-12 md:py-16">
        <CheckoutForm paymentOptions={paymentOptions} />
      </section>
    </>
  );
}
