"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function TrackForm({ orderNumber, email }: { orderNumber?: string; email?: string }) {
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const number = String(data.get("orderNumber")).trim().toUpperCase();
    const mail = String(data.get("email")).trim();
    router.push(`/orders/${encodeURIComponent(number)}?${new URLSearchParams({ email: mail })}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-5 border border-sand bg-cream p-6 md:p-10">
      <div>
        <label htmlFor="orderNumber" className="label">
          Order number
        </label>
        <input id="orderNumber" name="orderNumber" required defaultValue={orderNumber} placeholder="FBS-261002-XXXXX" className="input uppercase" />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email used at checkout
        </label>
        <input id="email" name="email" type="email" required defaultValue={email} className="input" autoComplete="email" />
      </div>
      <button type="submit" className="btn-primary w-full">
        <Search size={15} /> Track order
      </button>
    </form>
  );
}
