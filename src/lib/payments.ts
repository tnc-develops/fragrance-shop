import { api } from "./api";
import type { Order, PaymentMethod, PaymentOption } from "./types";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on delivery",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card payment",
};

export const FALLBACK_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    method: "COD",
    name: "Cash on delivery",
    description: "Pay in cash when your order arrives at your door.",
    instructions: null,
    bankAccounts: [],
    allowSlipUpload: false,
    allowWhatsappSlip: false,
    available: true,
  },
];

export const SLIP_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
/** Must match SLIP_MAX_MB on the backend. */
export const SLIP_MAX_MB = 10;

/** Null when the file can be uploaded, otherwise a message for the customer. */
export function slipProblem(file: File): string | null {
  if (!SLIP_ACCEPT.split(",").includes(file.type)) return "Please choose a JPG, PNG or WEBP photo, or a PDF.";
  if (file.size > SLIP_MAX_MB * 1024 * 1024) {
    return `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${SLIP_MAX_MB} MB, so please take a smaller photo or screenshot.`;
  }
  return null;
}

/** Guests prove ownership with the order email; signed-in buyers with their token. */
export async function uploadSlip(orderNumber: string, file: File, auth: { email?: string; token?: string | null }) {
  const form = new FormData();
  form.append("slip", file);
  if (auth.email) form.append("email", auth.email);
  return api<{ order: Order }>(`/orders/${encodeURIComponent(orderNumber)}/slip`, {
    method: "POST",
    token: auth.token,
    body: form,
  });
}
