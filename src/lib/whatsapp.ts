/** Digits in international format for wa.me, assuming Sri Lankan numbers when written locally (07X...). */
export function whatsappDigits(number: string | null | undefined): string | null {
  if (!number) return null;
  let digits = number.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `94${digits.slice(1)}`;
  return digits.length >= 9 ? digits : null;
}

export function whatsappLink(number: string | null | undefined, message?: string): string | null {
  const digits = whatsappDigits(number);
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telLink(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
