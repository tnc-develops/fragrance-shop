import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { OrderView } from "@/components/orders/OrderView";
import { first } from "@/lib/query";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[orderNumber]">) {
  const orderNumber = (await params).orderNumber.toUpperCase();
  const query = await searchParams;
  const placed = first(query.placed) === "1";

  return (
    <>
      <PageIntro
        title={placed ? "Order confirmed" : "Order details"}
        crumbs={[{ label: "Account", href: "/account" }, { label: orderNumber }]}
      />
      <section className="container-luxe py-12 md:py-16">
        <OrderView orderNumber={orderNumber} email={first(query.email)} placed={placed} />
      </section>
    </>
  );
}
