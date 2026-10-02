import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { AccountView } from "@/components/account/AccountView";
import { first } from "@/lib/query";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const next = first((await searchParams).next);
  return (
    <>
      <PageIntro title="My Account" description="Follow your orders, keep your details up to date and check out faster." crumbs={[{ label: "Account" }]} />
      <section className="container-luxe py-12 md:py-16">
        <AccountView next={next} />
      </section>
    </>
  );
}
