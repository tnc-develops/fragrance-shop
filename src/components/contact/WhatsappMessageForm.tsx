"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

const TOPICS = ["Product advice", "An existing order", "Bank transfer slip", "Gift or bulk order", "Something else"];

/** Builds a WhatsApp message from the form and opens the chat; nothing is stored on our side. */
export function WhatsappMessageForm({ number, shopName }: { number: string; shopName: string }) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const orderNumber = f.orderNumber.trim().toUpperCase();
    const message = [
      `Hello ${shopName},`,
      "",
      f.message.trim(),
      "",
      `Topic: ${f.topic}`,
      `Name: ${f.name.trim()}`,
      ...(orderNumber ? [`Order number: ${orderNumber}`] : []),
    ].join("\n");
    const href = whatsappLink(number, message);
    if (!href) {
      setError("Our WhatsApp number isn't available right now. Please call or email us instead.");
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Your name <span className="text-gold">*</span>
          </label>
          <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="topic" className="label">
            Topic
          </label>
          <select id="topic" name="topic" className="input" defaultValue={TOPICS[0]}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="orderNumber" className="label">
            Order number (optional)
          </label>
          <input id="orderNumber" name="orderNumber" maxLength={30} placeholder="FBS-XXXXXX-XXXXX" className="input uppercase placeholder:normal-case" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="label">
            Message <span className="text-gold">*</span>
          </label>
          <textarea id="message" name="message" required minLength={3} maxLength={1000} rows={5} className="input resize-none" placeholder="How can we help?" />
        </div>
      </div>
      {error && <p className="text-xs text-espresso">{error}</p>}
      <button type="submit" className="btn-primary gap-2">
        <Send size={14} /> Continue on WhatsApp
      </button>
      <p className="text-xs text-ink/50">This opens WhatsApp with your message ready to send.</p>
    </form>
  );
}
