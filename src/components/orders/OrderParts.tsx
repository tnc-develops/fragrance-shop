"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Check, Package, Truck, X } from "lucide-react";
import { formatDate, imageUrl, ORDER_STATUS_LABEL } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { usePrice } from "@/components/providers/SettingsProvider";

const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] uppercase",
        status === "CANCELLED" && "bg-ink/10 text-ink/60",
        status === "DELIVERED" && "bg-gold/20 text-espresso",
        status !== "CANCELLED" && status !== "DELIVERED" && "bg-espresso text-ivory",
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

/** Progress across the normal fulfilment flow, with each step dated from the order's events. */
export function OrderProgress({ order }: { order: Order }) {
  if (order.status === "CANCELLED") {
    const event = [...order.events].reverse().find((e) => e.status === "CANCELLED");
    return (
      <div className="flex items-start gap-4 border border-sand bg-cream p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink/60">
          <X size={16} />
        </span>
        <div>
          <p className="font-serif text-xl text-charcoal">This order was cancelled</p>
          {event && (
            <p className="mt-1 text-xs text-ink/60">
              {formatDate(event.createdAt, true)}
              {event.note ? ` - ${event.note}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }

  const current = FLOW.indexOf(order.status);
  const reachedAt = (status: OrderStatus) => order.events.find((e) => e.status === status)?.createdAt;
  const icons = [Check, Check, Package, Truck, Check];

  return (
    <ol className="grid grid-cols-5 gap-2">
      {FLOW.map((status, i) => {
        const Icon = icons[i];
        const done = i <= current;
        const at = reachedAt(status);
        return (
          <li key={status} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span className={clsx("absolute top-4 right-1/2 h-px w-full", i <= current ? "bg-gold" : "bg-sand")} />
            )}
            <span
              className={clsx(
                "relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                done ? "border-gold bg-gold text-charcoal" : "border-sand bg-ivory text-taupe",
              )}
            >
              <Icon size={14} />
            </span>
            <span className={clsx("mt-3 text-[10px] tracking-[0.14em] uppercase sm:text-[11px]", done ? "text-charcoal" : "text-taupe")}>
              {ORDER_STATUS_LABEL[status]}
            </span>
            {at && <span className="mt-1 hidden text-[10px] text-ink/50 sm:block">{formatDate(at)}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderHistory({ order }: { order: Order }) {
  return (
    <ul className="space-y-4 border-l border-sand pl-5">
      {[...order.events].reverse().map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute top-1.5 -left-[24px] h-2 w-2 rounded-full bg-gold" />
          <p className="text-sm text-charcoal">{ORDER_STATUS_LABEL[e.status]}</p>
          <p className="text-xs text-ink/50">{formatDate(e.createdAt, true)}</p>
          {e.note && <p className="mt-1 text-xs text-ink/70">{e.note}</p>}
        </li>
      ))}
    </ul>
  );
}

export function OrderItemsList({ order }: { order: Order }) {
  const format = usePrice();
  return (
    <ul className="divide-y divide-sand">
      {order.items.map((item) => {
        const src = imageUrl(item.image);
        return (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <div className="relative h-20 w-16 shrink-0 border border-sand bg-white">
              {src && <Image src={src} alt={item.name} fill sizes="64px" className="object-contain p-1.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg leading-snug text-charcoal">{item.name}</p>
              <p className="text-xs text-ink/60">
                {item.variantLabel && <span className="mr-2 tracking-[0.15em] text-taupe uppercase">{item.variantLabel}</span>}
                {item.quantity} x {format(item.price)}
              </p>
            </div>
            <p className="text-sm text-charcoal">{format(item.price * item.quantity)}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function OrderRow({ order }: { order: Order }) {
  const format = usePrice();
  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <Link
      href={`/orders/${order.orderNumber}`}
      className="flex flex-wrap items-center justify-between gap-4 border border-sand bg-cream px-5 py-4 transition-colors hover:border-gold"
    >
      <div>
        <p className="font-medium tracking-wide text-charcoal">{order.orderNumber}</p>
        <p className="mt-0.5 text-xs text-ink/60">
          {formatDate(order.createdAt)} - {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <OrderStatusBadge status={order.status} />
        <span className="font-serif text-xl text-charcoal">{format(order.total)}</span>
      </div>
    </Link>
  );
}
