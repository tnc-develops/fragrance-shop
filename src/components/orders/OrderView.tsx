"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiError, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/payments";
import type { Order } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/toast";
import { useHydrated, usePrice } from "@/components/providers/SettingsProvider";
import { BankTransferPanel } from "./BankTransferPanel";
import { OrderHistory, OrderItemsList, OrderProgress, OrderStatusBadge } from "./OrderParts";

const CANCELLABLE = new Set(["PENDING", "CONFIRMED"]);

function paymentNote(order: Order): string {
  if (order.paymentStatus === "PAID") return "Paid";
  if (order.paymentStatus === "REFUNDED") return "Refunded";
  if (order.paymentStatus === "FAILED") return "Payment failed";
  if (order.paymentMethod === "COD") return "Payable on delivery";
  if (order.paymentMethod === "BANK_TRANSFER") {
    return order.paymentSlipUploadedAt ? "Slip received, awaiting confirmation" : "Awaiting your transfer";
  }
  return "Awaiting payment";
}

function thankYouNote(order: Order): string {
  if (order.paymentMethod === "BANK_TRANSFER") {
    return order.paymentSlipUploadedAt
      ? `Your order and payment slip have been received. We'll confirm the transfer and call ${order.phone} before delivery.`
      : `Your order has been received. Please complete the bank transfer below and share your slip, and we'll dispatch once the payment is confirmed.`;
  }
  return `Your order has been received. We'll call ${order.phone} to confirm delivery, and you'll pay in cash when it arrives.`;
}

type State = { status: "loading" } | { status: "ready"; order: Order } | { status: "error"; message: string; notFound: boolean };

interface Props {
  orderNumber: string;
  email?: string;
  placed?: boolean;
}

export function OrderView({ orderNumber, email, placed }: Props) {
  const hydrated = useHydrated();
  const token = useAuth((s) => s.token);
  const format = usePrice();
  const [state, setState] = useState<State>({ status: "loading" });
  const [cancelling, setCancelling] = useState(false);
  const canLoad = hydrated && (!!email || !!token);

  useEffect(() => {
    if (!canLoad) return;
    let cancelled = false;
    const request = email
      ? api<{ order: Order }>(`/orders/track?${new URLSearchParams({ orderNumber, email })}`)
      : api<{ order: Order }>(`/orders/${encodeURIComponent(orderNumber)}`, { token });
    request
      .then((res) => !cancelled && setState({ status: "ready", order: res.order }))
      .catch((err) => {
        if (cancelled) return;
        const notFound = err instanceof ApiError && (err.status === 404 || err.status === 401);
        setState({ status: "error", message: errorMessage(err), notFound });
      });
    return () => {
      cancelled = true;
    };
  }, [canLoad, orderNumber, email, token]);

  if (hydrated && !canLoad) {
    return (
      <div className="mx-auto max-w-md space-y-5 py-12 text-center">
        <p className="font-serif text-3xl text-charcoal">View your order</p>
        <p className="text-sm text-ink/60">Sign in to the account you ordered with, or track it with your order email.</p>
        <div className="flex justify-center gap-3">
          <Link href={`/account?next=/orders/${orderNumber}`} className="btn-primary">
            Sign in
          </Link>
          <Link href={`/track?orderNumber=${orderNumber}`} className="btn-outline">
            Track order
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex justify-center py-24 text-taupe">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-md space-y-5 py-12 text-center">
        <p className="font-serif text-3xl text-charcoal">{state.notFound ? "Order not found" : "Something went wrong"}</p>
        <p className="text-sm text-ink/60">
          {state.notFound ? "We couldn't find an order matching those details." : state.message}
        </p>
        <Link href="/track" className="btn-primary">
          Track another order
        </Link>
      </div>
    );
  }

  const { order } = state;

  async function cancelOrder() {
    if (!window.confirm("Cancel this order? This can't be undone.")) return;
    setCancelling(true);
    try {
      const res = await api<{ order: Order }>(`/orders/${order.orderNumber}/cancel`, {
        method: "POST",
        token,
        body: email ? { email } : {},
      });
      setState({ status: "ready", order: res.order });
      toast("Your order has been cancelled");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-10">
      {placed && order.status !== "CANCELLED" && (
        <div className="flex items-start gap-4 border border-gold/50 bg-gold/10 p-6">
          <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={26} strokeWidth={1.5} />
          <div>
            <p className="font-serif text-2xl text-charcoal">Thank you, {order.customerName.split(" ")[0]}.</p>
            <p className="mt-1 text-sm text-ink/70">
              {thankYouNote(order)} Keep your order number <strong className="font-medium text-charcoal">{order.orderNumber}</strong> to track it.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-6">
        <div>
          <p className="eyebrow text-taupe">Order</p>
          <h2 className="mt-1 font-serif text-3xl text-charcoal">{order.orderNumber}</h2>
          <p className="mt-1 text-xs text-ink/60">Placed {formatDate(order.createdAt, true)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderProgress order={order} />

      {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "PENDING" && order.status !== "CANCELLED" && (
        <BankTransferPanel
          order={order}
          email={email}
          token={token}
          onUpdated={(next) => setState({ status: "ready", order: next })}
        />
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h3 className="eyebrow mb-2 text-ink/70">Items</h3>
            <OrderItemsList order={order} />
            <dl className="space-y-2 border-t border-sand pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/70">Subtotal</dt>
                <dd>{format(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/70">Delivery</dt>
                <dd className={order.shippingFee === 0 ? "text-gold" : ""}>{order.shippingFee === 0 ? "Complimentary" : format(order.shippingFee)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="eyebrow text-ink">Total</dt>
                <dd className="font-serif text-2xl text-charcoal">{format(order.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-6 border border-sand bg-cream p-6">
          <section>
            <h3 className="eyebrow mb-2 text-ink/70">Delivery to</h3>
            <address className="text-sm leading-relaxed text-ink not-italic">
              {order.customerName}
              <br />
              {order.addressLine1}
              {order.addressLine2 && (
                <>
                  <br />
                  {order.addressLine2}
                </>
              )}
              <br />
              {[order.city, order.state, order.postalCode].filter(Boolean).join(", ")}
              <br />
              {order.country}
              <br />
              <span className="text-ink/60">{order.phone}</span>
            </address>
          </section>
          <section>
            <h3 className="eyebrow mb-2 text-ink/70">Payment</h3>
            <p className="text-sm text-ink">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            <p className="text-xs text-ink/60">{paymentNote(order)}</p>
          </section>
          <section>
            <h3 className="eyebrow mb-3 text-ink/70">History</h3>
            <OrderHistory order={order} />
          </section>
          {CANCELLABLE.has(order.status) && (
            <button onClick={cancelOrder} disabled={cancelling} className="btn-outline w-full">
              {cancelling && <Loader2 size={14} className="animate-spin" />} Cancel order
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
