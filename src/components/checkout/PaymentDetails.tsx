"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Banknote, Check, Copy, CreditCard, FileUp, Landmark, MessageCircle } from "lucide-react";
import { SLIP_ACCEPT, SLIP_MAX_MB, slipProblem } from "@/lib/payments";
import type { BankAccount, PaymentMethod } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "@/store/toast";

export const PAYMENT_ICONS: Record<PaymentMethod, typeof Banknote> = {
  COD: Banknote,
  BANK_TRANSFER: Landmark,
  CARD: CreditCard,
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Couldn't copy. Please select the text instead.", "error");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-taupe transition-colors hover:text-gold"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function Row({ label, value, copy, strong }: { label: string; value: string; copy?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-xs text-ink/60">{label}</dt>
      <dd className={clsx("flex items-center gap-1 text-right text-sm", strong ? "font-medium text-charcoal" : "text-ink")}>
        <span className="break-all">{value}</span>
        {copy && <CopyButton value={value.replace(/\s/g, "")} label={label.toLowerCase()} />}
      </dd>
    </div>
  );
}

interface BankDetailsProps {
  accounts: BankAccount[];
  instructions?: string | null;
  amount?: string;
  reference?: string;
}

export function BankDetails({ accounts, instructions, amount, reference }: BankDetailsProps) {
  return (
    <div className="space-y-4">
      {(amount || reference) && (
        <dl className="divide-y divide-sand border border-sand bg-white px-4 py-2">
          {amount && <Row label="Amount to transfer" value={amount} strong />}
          {reference && <Row label="Payment reference" value={reference} copy strong />}
        </dl>
      )}
      {accounts.map((a) => (
        <dl key={`${a.bankName}-${a.accountNumber}`} className="divide-y divide-sand border border-sand bg-white px-4 py-2">
          <Row label="Bank" value={a.bankName} />
          <Row label="Account name" value={a.accountName} />
          <Row label="Account number" value={a.accountNumber} copy strong />
          {a.branch && <Row label="Branch" value={a.branch} />}
        </dl>
      ))}
      {instructions && <p className="text-xs leading-relaxed whitespace-pre-line text-ink/70">{instructions}</p>}
    </div>
  );
}

export function WhatsappSlipButton({
  number,
  orderNumber,
  amount,
  className,
}: {
  number: string | null;
  orderNumber?: string;
  amount?: string;
  className?: string;
}) {
  const message = orderNumber
    ? `Hello, here is the bank transfer slip for order ${orderNumber}${amount ? ` (${amount})` : ""}.`
    : "Hello, I'd like to send my bank transfer slip.";
  const href = whatsappLink(number, message);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={clsx("btn-outline gap-2", className)}>
      <MessageCircle size={16} /> Send slip on WhatsApp
    </a>
  );
}

interface SlipPickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

/** File chooser for the slip; uploading is up to the caller. */
export function SlipPicker({ file, onChange, disabled }: SlipPickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);

  function pick(next: File | null) {
    const issue = next ? slipProblem(next) : null;
    setProblem(issue);
    if (issue && input.current) input.current.value = "";
    onChange(issue ? null : next);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={input}
          type="file"
          accept={SLIP_ACCEPT}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        <button type="button" disabled={disabled} onClick={() => input.current?.click()} className="btn-outline gap-2">
          <FileUp size={16} /> {file ? "Choose another" : "Choose slip"}
        </button>
        {file ? (
          <span className="flex min-w-0 items-center gap-2 text-xs text-ink/70">
            <span className="max-w-[min(14rem,60vw)] truncate">{file.name}</span>
            <button
              type="button"
              className="underline underline-offset-4 hover:text-gold"
              onClick={() => {
                pick(null);
                if (input.current) input.current.value = "";
              }}
            >
              Remove
            </button>
          </span>
        ) : (
          <span className="text-xs text-ink/50">JPG, PNG, WEBP or PDF, up to {SLIP_MAX_MB} MB</span>
        )}
      </div>
      {problem && (
        <p role="alert" className="text-xs text-red-700">
          {problem}
        </p>
      )}
    </div>
  );
}