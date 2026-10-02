export interface CurrencyConfig {
  currency: string;
  currencySymbol: string;
}

export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatPrice(amount: number, cfg: CurrencyConfig): string {
  const value = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${cfg.currencySymbol} ${value}`;
}

export function effectivePrice(p: { price: number; salePrice: number | null }): number {
  return p.salePrice !== null && p.salePrice < p.price ? p.salePrice : p.price;
}

export function formatDate(value: string, withTime = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

export const GENDER_LABEL = { MEN: "For Him", WOMEN: "For Her", UNISEX: "Unisex" } as const;

export const ORDER_STATUS_LABEL = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being prepared",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;
