export type Gender = "MEN" | "WOMEN" | "UNISEX";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "COD" | "BANK_TRANSFER" | "CARD";

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
}

export interface PaymentOption {
  method: PaymentMethod;
  name: string;
  description: string | null;
  instructions: string | null;
  bankAccounts: BankAccount[];
  allowSlipUpload: boolean;
  allowWhatsappSlip: boolean;
  available: boolean;
}

export interface ThemeColors {
  ivory: string;
  charcoal: string;
  gold: string;
  taupe: string;
  text: string;
  espresso: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string | null;
  /** Logo for light backgrounds (header). */
  logoLightUrl: string | null;
  /** Logo for dark backgrounds (footer). */
  logoDarkUrl: string | null;
  announcement: string | null;
  currency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingThreshold: number | null;
  heroIntervalMs: number;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  openingHours: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  metaDescription: string | null;
  /** Home page title in Google; other pages use "<page> | <shop name>". */
  seoTitle: string | null;
  /** Comma-separated search phrases. */
  seoKeywords: string | null;
  /** Google Search Console HTML-tag verification code. */
  googleVerification: string | null;
  seoIntroHeading: string | null;
  seoIntroText: string | null;
  colors: ThemeColors;
}

export interface AboutSection {
  title: string;
  body: string;
  image: string | null;
}

export interface AboutValue {
  title: string;
  text: string;
}

export interface AboutPage {
  eyebrow: string | null;
  heading: string;
  intro: string | null;
  heroImage: string | null;
  sections: AboutSection[];
  values: AboutValue[];
  ctaHeading: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
}

export interface HeroSlide {
  id: number;
  imageDesktop: string;
  imageMobile: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
}

export interface Poster {
  id: number;
  imageDesktop: string;
  imageMobile: string | null;
  title: string | null;
  link: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount?: number;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
}

/** A purchasable bottle size. Empty descriptions and images fall back to the product's. */
export interface ProductVariant {
  id: number;
  sizeMl: number | null;
  label: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  sku: string | null;
  shortDescription: string | null;
  description: string | null;
  isDefault: boolean;
  images: ProductImage[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  shortDescription: string | null;
  description: string | null;
  /** Summary of the variants: cheapest price, total stock, default size. */
  price: number;
  salePrice: number | null;
  stock: number;
  sizeMl: number | null;
  variants: ProductVariant[];
  concentration: string | null;
  gender: Gender;
  topNotes: string | null;
  heartNotes: string | null;
  baseNotes: string | null;
  featured: boolean;
  ratingAvg: number;
  ratingCount: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
  updatedAt?: string;
  images: ProductImage[];
  categories: Pick<Category, "id" | "name" | "slug">[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface QuoteLine {
  productId: number;
  variantId: number;
  name: string;
  variantLabel: string | null;
  slug: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  stock: number;
  lineTotal: number;
  issue: string | null;
}

export interface Quote {
  lines: QuoteLine[];
  missingVariantIds: number[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number | null;
  hasIssues: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
}

export interface OrderItem {
  id: number;
  productId: number | null;
  variantId: number | null;
  name: string;
  variantLabel: string | null;
  image: string | null;
  price: number;
  quantity: number;
}

export interface OrderEvent {
  id: number;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentSlipUploadedAt: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  events: OrderEvent[];
}

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  authorName: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<string, number>;
}
