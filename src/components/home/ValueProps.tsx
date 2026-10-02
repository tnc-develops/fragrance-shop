import { Gift, ShieldCheck, Truck, Wallet } from "lucide-react";
import type { ShopSettings } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function ValueProps({ settings }: { settings: ShopSettings }) {
  const items = [
    {
      icon: Gift,
      title: "Complimentary gift",
      text: settings.freeShippingThreshold
        ? `With every order over ${formatPrice(settings.freeShippingThreshold, settings)}`
        : "Thoughtful extras with every order",
    },
    { icon: ShieldCheck, title: "100% authentic", text: "Sourced directly from houses and authorised distributors" },
    { icon: Wallet, title: "Cash on delivery", text: "Pay when your fragrance arrives at your door" },
    { icon: Truck, title: "Island-wide delivery", text: "Carefully packed and delivered anywhere in Sri Lanka" },
  ];

  return (
    <section className="border-y border-sand bg-ivory">
      <div className="container-luxe grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
              <Icon size={22} strokeWidth={1.25} />
            </span>
            <h3 className="font-serif text-xl text-charcoal">{title}</h3>
            <p className="max-w-[220px] text-xs leading-relaxed text-ink/65">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
