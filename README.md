# Fragrance by Shoon — Storefront

The customer-facing shop: a luxury fragrance storefront built with Next.js 16 (App Router), React 19 and Tailwind CSS 4.
All data and images come from [fragrance-shop-backend](https://github.com/tnc-develops/fragrance-shop-backend);
the shop is managed from [fragrance-shop-admin](https://github.com/tnc-develops/fragrance-shop-admin).

## Features

- **Home page**: full-screen hero whose background changes every 5 seconds (the timing is set in the admin), with
  "Fragrance by Shoon" on the left. Below it are a promotional poster carousel (separate desktop and mobile artwork),
  collection grid, featured products and brand story.
- **Navigation**: Home, Shop, Offers, About us and Contact in the header (collections are listed in the mobile menu and
  footer). A floating WhatsApp button opens a chat with the shop when a WhatsApp number is set.
- **Shop**: search, collection, gender and price filters, on-sale filter and sorting, all kept in the URL.
- **Offers**: `/offers` lists every product with a discounted size. Cards show "Up to -X%" and which sizes are on offer.
- **About us**: `/about` shows the story, photos, values and closing button written in the admin, plus the shop's
  contact details.
- **Contact**: `/contact` has tap-to-call, WhatsApp, email and map links, opening hours, and a form that opens WhatsApp
  with the customer's message ready to send. All details come from the admin settings.
- **Product pages**: size selector (price, photos, descriptions and stock follow the chosen size, and the size is kept
  in the URL as `?size=50`), gallery, fragrance notes, stock-aware add to bag, ratings and moderated reviews. Product
  cards show the available sizes and a "From" price when sizes differ.
- **Bag**: slide-out drawer plus a full `/cart` page, one line per size. Prices and stock are re-checked live against
  the server, and a signed-in customer's bag follows them across devices.
- **Checkout**: as a guest or signed in, with a district picker and free-delivery progress. The payment methods come
  from the admin: cash on delivery, and bank transfer with the shop's account details, the amount to send and an
  optional slip upload. Prices are shown in the currency set in the admin (LKR by default).
- **Bank transfer orders**: the order page shows the bank details and order number to use as the reference, lets the
  customer upload (or replace) their slip, or send it on WhatsApp with a pre-filled message, and shows when it's
  received and confirmed.
- **Accounts**: register or sign in, order history, profile and password.
- **Order tracking**: `/track` by order number and email, with a status timeline. Customers can cancel orders while
  they are still pending or confirmed.
- **Theme**: palette, shop name, logos, announcement bar and contact details all come from the admin settings. The
  header uses the light-background logo and the footer the dark-background one; with no logo the shop name is shown.

## Getting started

Start the backend first (see its README), then:

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public address of the storefront, e.g. `https://fragrancebyshoon.com`. Used for canonical links, the sitemap and Google structured data, so it must be the live domain in production |
| `NEXT_PUBLIC_API_URL` | Public URL of the backend (API and `/uploads` images), e.g. `http://localhost:4000` |
| `API_INTERNAL_URL` | Optional URL the Next.js server uses to reach the API (e.g. a private network host) |
| `IMAGES_ALLOW_LOCAL_IP` | `true` in development so `next/image` can optimize images from `localhost`; `false` in production |

## SEO

- **Titles and descriptions** are written for Sri Lankan perfume searches. The home page uses the title, description
  and keywords from **Admin → Settings → SEO & Google**. Product pages become
  "*Brand Name Concentration* Price in Sri Lanka" with the starting price in LKR, unless the product has its own SEO
  title and description in the admin. Collection and gender pages get titles such as "Men's Perfumes in Sri Lanka".
- **Structured data** (schema.org JSON-LD) for Google rich results: the store and site search on every page, and on
  product pages each bottle size as an offer with price, stock, delivery and returns, plus rating and breadcrumbs.
- **Canonical links** on every indexable page. Sort and price filters share their collection's canonical URL, and
  search results, the bag, checkout, account, order and tracking pages are `noindex`.
- **`/sitemap.xml`** lists pages, collections and every product with its images; **`/robots.txt`** points to it and
  keeps crawlers out of private pages. `/manifest.webmanifest` and the icons let phones add the shop to the home screen.
- **Home page introduction**: keyword-rich text, links to every collection and a short FAQ near the bottom, edited in
  the admin.

### Going live on Google

1. Set `NEXT_PUBLIC_SITE_URL` to the real domain and deploy over HTTPS.
2. In [Google Search Console](https://search.google.com/search-console) add the domain, choose the **HTML tag**
   method, and paste the code into **Admin → Settings → SEO & Google → Google Search Console verification code**.
3. Once verified, submit `https://your-domain/sitemap.xml` under **Sitemaps**.
4. Check product pages with the [Rich Results Test](https://search.google.com/test/rich-results).

## Security

Every response has a Content Security Policy, `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, a
permissions policy and (in production) HSTS. The `X-Powered-By` header is removed. Slip uploads are checked in the
browser before sending (JPG, PNG, WEBP or PDF up to 10 MB) and again by the backend.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Project layout

```
src/
  app/            routes: /, /shop, /offers, /about, /product/[slug], /cart, /checkout, /account, /track, /orders/[orderNumber]
  components/     home, shop, product, cart, checkout, orders, account, layout and ui pieces
  hooks/          useQuote (live cart pricing), useHydrated
  lib/            API client, server data loaders, formatting, types
  store/          zustand stores for the bag and the signed-in customer (persisted in localStorage)
```

Server data such as products, banners and settings is cached for 30 seconds, so admin changes show up on the
storefront within about half a minute.

## Palette

| Token | Color | Use |
| --- | --- | --- |
| `ivory` | `#F4EFE7` | Page background |
| `charcoal` | `#171717` | Dark sections, prices |
| `gold` | `#C9A66B` | Accents, hovers, sale prices |
| `taupe` | `#A99B89` | Secondary text, borders |
| `ink` | `#24211E` | Body text |
| `espresso` | `#30251F` | Buttons |

The admin can change these under **Settings → Brand colors**. They are applied as CSS variables at render time.
