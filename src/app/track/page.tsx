import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { TrackForm } from "@/components/orders/TrackForm";
import { first } from "@/lib/query";

export const metadata: Metadata = { title: "Track your order", robots: { index: false, follow: true } };

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const query = await searchParams;
  return (
    <>
      <PageIntro
        title="Track your order"
        description="Enter your order number and the email you used at checkout to see the latest status."
        crumbs={[{ label: "Track order" }]}
      />
      <section className="container-luxe py-12 md:py-20">
        <TrackForm orderNumber={first(query.orderNumber)} email={first(query.email)} />
      </section>
    </>
  );
}
