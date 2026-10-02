"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/whatsapp";
import { useSettings } from "@/components/providers/SettingsProvider";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";

const HIDDEN_ON = ["/checkout", "/contact"];

/** Floating chat shortcut, shown when a WhatsApp number is set in the admin. */
export function WhatsappButton() {
  const settings = useSettings();
  const pathname = usePathname();
  const href = whatsappLink(settings.whatsappNumber, `Hello ${settings.shopName}, I have a question.`);
  if (!href || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-[45] flex h-13 w-13 items-center justify-center rounded-full bg-espresso text-ivory shadow-[0_10px_30px_-10px_rgba(23,23,23,0.6)] transition-all duration-300 hover:scale-105 hover:bg-gold hover:text-charcoal md:right-8 md:bottom-8"
    >
      <WhatsappIcon size={24} />
    </a>
  );
}
