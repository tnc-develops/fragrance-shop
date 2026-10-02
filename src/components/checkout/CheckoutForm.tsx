"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Loader2, Lock, ShoppingBag } from "lucide-react";
import { api, ApiError, errorMessage } from "@/lib/api";
import { imageUrl } from "@/lib/format";
import { uploadSlip } from "@/lib/payments";
import type { Order, PaymentMethod, PaymentOption } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { toQuoteInput, useCart } from "@/store/cart";
import { toast } from "@/store/toast";
import { useQuote } from "@/hooks/useQuote";
import { useHydrated, usePrice, useSettings } from "@/components/providers/SettingsProvider";
import { OrderTotals } from "@/components/cart/OrderTotals";
import { BankDetails, PAYMENT_ICONS, SlipPicker } from "./PaymentDetails";

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna",
  "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

type FieldErrors = Partial<Record<string, string>>;

interface PlaceOrderResponse {
  order: Order;
  payment: { redirectUrl: string | null };
}

function Field({
  name,
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; error?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
        {props.required && <span className="text-gold"> *</span>}
      </label>
      <input id={name} name={name} className={clsx("input", error && "border-espresso")} aria-invalid={!!error} {...props} />
      {error && <p className="mt-1 text-xs text-espresso">{error}</p>}
    </div>
  );
}

export function CheckoutForm({ paymentOptions }: { paymentOptions: PaymentOption[] }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const lines = useCart((s) => s.lines);
  const { quote, loading, refresh } = useQuote(hydrated);
  const format = usePrice();
  const settings = useSettings();

  const [method, setMethod] = useState<PaymentMethod>(paymentOptions[0]?.method ?? "COD");
  const [slip, setSlip] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!hydrated || placed) {
    return <div className="h-96 animate-pulse bg-mist" />;
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center gap-5 border border-dashed border-sand py-24 text-center">
        <ShoppingBag size={44} strokeWidth={1} className="text-taupe" />
        <p className="font-serif text-3xl text-charcoal">There&apos;s nothing to check out yet</p>
        <Link href="/shop" className="btn-primary mt-3">
          Explore perfumes
        </Link>
      </div>
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const issues = new Map(quote?.lines.map((l) => [l.variantId, l.issue]));
  const selected = paymentOptions.find((o) => o.method === method);
  const slipAllowed = method === "BANK_TRANSFER" && !!selected?.allowSlipUpload;
  const whatsappAllowed = method === "BANK_TRANSFER" && !!selected?.allowWhatsappSlip && !!settings.whatsappNumber;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const res = await api<PlaceOrderResponse>("/orders", {
        method: "POST",
        token,
        body: { ...form, paymentMethod: method, items: toQuoteInput(useCart.getState().lines) },
      });
      setPlaced(true);
      useCart.getState().clear();
      if (res.payment.redirectUrl) {
        window.location.href = res.payment.redirectUrl;
        return;
      }
      if (slipAllowed && slip) {
        try {
          await uploadSlip(res.order.orderNumber, slip, { email: res.order.email, token });
        } catch (err) {
          toast(`Your order is placed, but the slip didn't upload: ${errorMessage(err)} You can try again on the next page.`, "error");
        }
      }
      const params = new URLSearchParams({ email: res.order.email, placed: "1" });
      router.replace(`/orders/${res.order.orderNumber}?${params}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && Array.isArray(err.details)) {
        const next: FieldErrors = {};
        for (const d of err.details as { field?: string; message: string }[]) {
          if (d.field) next[d.field] ??= d.message;
        }
        setFieldErrors(next);
        setFormError("Please check the highlighted fields.");
      } else if (err instanceof ApiError && err.status === 409) {
        setFormError(err.message + ". We've refreshed your bag with the latest availability.");
        refresh();
      } else {
        setFormError(errorMessage(err));
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
      <div key={user?.id ?? "guest"} className="space-y-10">
        <fieldset className="space-y-5">
          <div className="flex items-baseline justify-between">
            <legend className="font-serif text-2xl text-charcoal">Contact</legend>
            {!user && (
              <Link href="/account?next=/checkout" className="text-xs text-ink/60 hover:text-gold">
                Have an account? <span className="underline underline-offset-4">Sign in</span>
              </Link>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="customerName" label="Full name" required minLength={2} autoComplete="name" defaultValue={user?.name} error={fieldErrors.customerName} className="sm:col-span-2" />
            <Field name="email" label="Email" type="email" required autoComplete="email" defaultValue={user?.email} error={fieldErrors.email} />
            <Field name="phone" label="Phone" type="tel" required minLength={5} autoComplete="tel" placeholder="07X XXX XXXX" defaultValue={user?.phone ?? undefined} error={fieldErrors.phone} />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-serif text-2xl text-charcoal">Delivery address</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="addressLine1" label="Address" required minLength={3} autoComplete="address-line1" placeholder="House number, street, area" error={fieldErrors.addressLine1} className="sm:col-span-2" />
            <Field name="addressLine2" label="Apartment, landmark (optional)" autoComplete="address-line2" error={fieldErrors.addressLine2} className="sm:col-span-2" />
            <Field name="city" label="City / town" required minLength={2} autoComplete="address-level2" placeholder="e.g. Colombo 07" error={fieldErrors.city} />
            <div>
              <label htmlFor="state" className="label">
                District
              </label>
              <select id="state" name="state" className="input" autoComplete="address-level1" defaultValue="">
                <option value="">Select district</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <Field name="postalCode" label="Postal code (optional)" autoComplete="postal-code" inputMode="numeric" placeholder="e.g. 00700" error={fieldErrors.postalCode} />
            <Field name="country" label="Country" required readOnly defaultValue="Sri Lanka" autoComplete="country-name" error={fieldErrors.country} className="[&_input]:cursor-not-allowed [&_input]:bg-mist" />
          </div>
          <div>
            <label htmlFor="notes" className="label">
              Delivery notes
            </label>
            <textarea id="notes" name="notes" rows={3} maxLength={2000} className="input resize-none" placeholder="Preferred delivery time, gift message..." />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-serif text-2xl text-charcoal">Payment</legend>
          {paymentOptions.map((option) => {
            const Icon = PAYMENT_ICONS[option.method];
            const checked = option.method === method;
            return (
              <div key={option.method} className={clsx("border transition-colors", checked ? "border-gold bg-cream" : "border-sand bg-white hover:border-taupe")}>
                <label className="flex cursor-pointer items-start gap-4 p-5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.method}
                    checked={checked}
                    onChange={() => setMethod(option.method)}
                    className="mt-1 accent-[var(--color-espresso)]"
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-2 font-medium text-charcoal">
                      <Icon size={18} className="text-gold" /> {option.name}
                    </span>
                    {option.description && <span className="mt-1 block text-xs text-ink/60">{option.description}</span>}
                  </span>
                </label>

                {checked && option.method === "BANK_TRANSFER" && (
                  <div className="space-y-5 border-t border-sand px-5 pt-5 pb-6">
                    <BankDetails
                      accounts={option.bankAccounts}
                      instructions={option.instructions}
                      amount={format(quote?.total ?? subtotal)}
                    />
                    {slipAllowed && (
                      <div className="space-y-2">
                        <p className="label">Payment slip (optional)</p>
                        <p className="text-xs text-ink/60">
                          Already paid? Attach the slip now. You can also add it later from your order page
                          {whatsappAllowed ? " or send it to us on WhatsApp" : ""}.
                        </p>
                        <SlipPicker file={slip} onChange={setSlip} disabled={submitting} />
                      </div>
                    )}
                    {!slipAllowed && whatsappAllowed && (
                      <p className="text-xs text-ink/60">
                        After placing your order, send the slip to us on WhatsApp at{" "}
                        <span className="font-medium text-charcoal">{settings.whatsappNumber}</span> with your order number.
                      </p>
                    )}
                  </div>
                )}
                {checked && option.method !== "BANK_TRANSFER" && option.instructions && (
                  <p className="border-t border-sand px-5 py-4 text-xs whitespace-pre-line text-ink/70">{option.instructions}</p>
                )}
              </div>
            );
          })}
        </fieldset>
      </div>

      <aside className="space-y-6 border border-sand bg-cream p-6 md:p-8 lg:sticky lg:top-32">
        <h2 className="font-serif text-2xl text-charcoal">Your order</h2>
        <ul className="max-h-80 space-y-4 overflow-y-auto pr-1">
          {lines.map((line) => {
            const src = imageUrl(line.image);
            const issue = issues.get(line.variantId);
            return (
              <li key={line.variantId} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0 border border-sand bg-white">
                  {src && <Image src={src} alt={line.name} fill sizes="64px" className="object-contain p-1.5" />}
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-espresso text-[10px] text-ivory">
                    {line.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg leading-snug text-charcoal">{line.name}</p>
                  {line.variantLabel && <p className="text-[11px] tracking-[0.15em] text-taupe uppercase">{line.variantLabel}</p>}
                  {issue && <p className="text-xs text-espresso">{issue}</p>}
                </div>
                <p className="text-sm text-charcoal">{format(line.price * line.quantity)}</p>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-sand pt-5">
          <OrderTotals quote={quote} subtotal={subtotal} loading={loading} />
        </div>

        {quote?.hasIssues && (
          <p className="border border-gold/40 bg-gold/10 px-4 py-3 text-xs text-espresso">
            Some items need attention.{" "}
            <Link href="/cart" className="underline underline-offset-4">
              Review your bag
            </Link>
          </p>
        )}
        {formError && (
          <p role="alert" className="border border-espresso/30 bg-espresso/5 px-4 py-3 text-xs text-espresso">
            {formError}
          </p>
        )}

        <button type="submit" disabled={submitting || quote?.hasIssues} className="btn-primary w-full py-4">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
          {submitting ? "Placing order..." : "Place order"}
        </button>
        <p className="text-center text-[11px] text-ink/50">
          By placing your order you agree to our delivery and returns terms.
        </p>
      </aside>
    </form>
  );
}
