import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { PageIntro } from "@/components/ui/PageIntro";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { WhatsappMessageForm } from "@/components/contact/WhatsappMessageForm";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return pageMetadata({
    settings,
    title: "Contact Us",
    description: `Call, WhatsApp or email ${settings.shopName}, your online perfume shop in Sri Lanka. Ask about orders, delivery, sizes or perfume recommendations.`,
    path: "/contact",
  });
}

interface Channel {
  key: string;
  title: string;
  value: string;
  hint: string;
  href?: string;
  external?: boolean;
  icon: LucideIcon | "whatsapp";
}

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsapp = whatsappLink(settings.whatsappNumber, `Hello ${settings.shopName}, I have a question.`);

  const channels: Channel[] = [];
  if (settings.contactPhone) {
    channels.push({
      key: "phone",
      title: "Call us",
      value: settings.contactPhone,
      hint: "Speak to us about orders, delivery or fragrance advice.",
      href: telLink(settings.contactPhone),
      icon: Phone,
    });
  }
  if (whatsapp && settings.whatsappNumber) {
    channels.push({
      key: "whatsapp",
      title: "WhatsApp",
      value: settings.whatsappNumber,
      hint: "Chat with us, or send your bank transfer slip with your order number.",
      href: whatsapp,
      external: true,
      icon: "whatsapp",
    });
  }
  if (settings.contactEmail) {
    channels.push({
      key: "email",
      title: "Email",
      value: settings.contactEmail,
      hint: "We usually reply within one working day.",
      href: `mailto:${settings.contactEmail}`,
      icon: Mail,
    });
  }
  if (settings.address) {
    channels.push({
      key: "address",
      title: "Visit",
      value: settings.address,
      hint: "Island-wide delivery across Sri Lanka.",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`,
      external: true,
      icon: MapPin,
    });
  }

  return (
    <>
      <PageIntro
        title="Contact us"
        description="Questions about a scent, an order or a payment? Reach us by phone, WhatsApp or email."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="container-luxe grid items-start gap-12 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="space-y-8">
          {channels.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {channels.map(({ key, title, value, hint, href, external, icon: Icon }) => (
                <li key={key}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex h-full flex-col gap-3 border border-sand bg-cream p-6 transition-colors hover:border-gold"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-espresso text-ivory transition-colors group-hover:bg-gold group-hover:text-charcoal">
                      {Icon === "whatsapp" ? <WhatsappIcon size={20} /> : <Icon size={20} strokeWidth={1.5} />}
                    </span>
                    <span className="eyebrow text-taupe">{title}</span>
                    <span className="font-serif text-lg [overflow-wrap:anywhere] text-charcoal">{value}</span>
                    <span className="text-xs leading-relaxed text-ink/60">{hint}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">Contact details will be available soon.</p>
          )}

          {settings.openingHours && (
            <div className="flex items-start gap-4 border-t border-sand pt-6">
              <Clock size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <p className="eyebrow text-taupe">Opening hours</p>
                <p className="mt-1 text-sm text-ink">{settings.openingHours}</p>
              </div>
            </div>
          )}

          <div className="border-t border-sand pt-6 text-sm text-ink/70">
            Already ordered?{" "}
            <Link href="/track" className="text-charcoal underline underline-offset-4 hover:text-gold">
              Track your order
            </Link>{" "}
            to see its status, or upload your bank transfer slip from the order page.
          </div>
        </div>

        <div className="border border-sand bg-white p-6 md:p-10">
          <p className="eyebrow text-gold">Send us a message</p>
          <h2 className="mt-2 mb-6 font-serif text-3xl text-charcoal">We&apos;re happy to help</h2>
          {settings.whatsappNumber && whatsapp ? (
            <WhatsappMessageForm number={settings.whatsappNumber} shopName={settings.shopName} />
          ) : settings.contactEmail ? (
            <p className="text-sm text-ink/70">
              Email us at{" "}
              <a href={`mailto:${settings.contactEmail}`} className="text-charcoal underline underline-offset-4 hover:text-gold">
                {settings.contactEmail}
              </a>{" "}
              and we&apos;ll get back to you soon.
            </p>
          ) : (
            <p className="text-sm text-ink/60">Messaging will be available soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
