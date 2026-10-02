"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Landmark, Loader2, Upload } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { uploadSlip } from "@/lib/payments";
import type { Order, PaymentOption } from "@/lib/types";
import { toast } from "@/store/toast";
import { usePrice, useSettings } from "@/components/providers/SettingsProvider";
import { BankDetails, SlipPicker, WhatsappSlipButton } from "@/components/checkout/PaymentDetails";

interface Props {
  order: Order;
  email?: string;
  token: string | null;
  onUpdated: (order: Order) => void;
}

/** Bank details, slip upload and WhatsApp hand-off for an unpaid bank transfer order. */
export function BankTransferPanel({ order, email, token, onUpdated }: Props) {
  const format = usePrice();
  const settings = useSettings();
  const [option, setOption] = useState<PaymentOption | null>(null);
  const [slip, setSlip] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<{ option: PaymentOption }>("/payment-methods/BANK_TRANSFER")
      .then((res) => !cancelled && setOption(res.option))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const amount = format(order.total);
  const slipAt = order.paymentSlipUploadedAt;
  const canUpload = option?.allowSlipUpload ?? true;
  const canWhatsapp = (option?.allowWhatsappSlip ?? true) && !!settings.whatsappNumber;

  async function submit() {
    if (!slip) return;
    setUploading(true);
    try {
      const res = await uploadSlip(order.orderNumber, slip, { email, token });
      onUpdated(res.order);
      setSlip(null);
      setReplacing(false);
      toast("Thank you. We've received your payment slip.");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-6 border border-gold/50 bg-cream p-6 md:p-8">
      <div className="flex items-start gap-4">
        <Landmark className="mt-1 shrink-0 text-gold" size={24} strokeWidth={1.5} />
        <div>
          <h3 className="font-serif text-2xl text-charcoal">{slipAt ? "Payment slip received" : "Complete your bank transfer"}</h3>
          <p className="mt-1 text-sm text-ink/70">
            {slipAt
              ? `We received your slip on ${formatDate(slipAt, true)}. We'll confirm your payment and prepare your order for dispatch.`
              : `Transfer ${amount} to the account below and use ${order.orderNumber} as the reference. Then share your slip so we can confirm your payment.`}
          </p>
        </div>
      </div>

      {!slipAt && (
        <BankDetails
          accounts={option?.bankAccounts ?? []}
          instructions={option?.instructions}
          amount={amount}
          reference={order.orderNumber}
        />
      )}

      {slipAt && !replacing ? (
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 text-sm text-charcoal">
            <CheckCircle2 size={18} className="text-gold" /> Slip uploaded
          </span>
          {canUpload && (
            <button type="button" onClick={() => setReplacing(true)} className="text-xs text-ink/60 underline underline-offset-4 hover:text-gold">
              Upload a different slip
            </button>
          )}
        </div>
      ) : (
        (canUpload || canWhatsapp) && (
          <div className="space-y-3 border-t border-sand pt-5">
            <p className="label">Share your payment slip</p>
            {canUpload && (
              <div className="flex flex-wrap items-center gap-3">
                <SlipPicker file={slip} onChange={setSlip} disabled={uploading} />
                {slip && (
                  <button type="button" onClick={submit} disabled={uploading} className="btn-primary gap-2">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploading ? "Uploading..." : "Upload slip"}
                  </button>
                )}
              </div>
            )}
            {canWhatsapp && (
              <div className="flex flex-wrap items-center gap-3">
                {canUpload && <span className="text-xs tracking-[0.2em] text-taupe uppercase">or</span>}
                <WhatsappSlipButton number={settings.whatsappNumber} orderNumber={order.orderNumber} amount={amount} />
                <span className="text-xs text-ink/60">{settings.whatsappNumber}</span>
              </div>
            )}
          </div>
        )
      )}
    </section>
  );
}
