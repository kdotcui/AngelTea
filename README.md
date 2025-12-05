Last updated 05:15 12/05/2025 UTC

Angel Tea – Modern Cafe Site w/ Admin CMS, AI Quiz, and Stripe Shop
===============================================================

Angel Tea is a full‑stack Next.js 15 application for a real cafe on Moody Street (Waltham, MA). It combines a multilingual marketing site, a lightweight admin CMS backed by Firebase (Firestore + Storage), an AI‑powered “Boba Personality” quiz, and a simple merchandise shop with Stripe payment links — all designed for speed, maintainability, and a great UX.

Overview
--------

- **Multilingual marketing site** with localized content (English, Spanish, Chinese) via `next-intl`.
- **Homepage CMS sections**:
  - Hero slideshow managed from admin, images hosted on Firebase Storage.
  - Popular Drinks gallery (image, description, price or sizes, optional story/video).
  - Menu boards sections (drinks/food/desserts), About/Story, FAQs, Press links, and Visit info with embedded map.
- **AI Personality Quiz** that analyzes user answers to recommend drinks. The result includes a server‑rendered share card image.
- **Admin dashboard** (Google Sign‑In gated) to manage hero slides, popular drinks, and shop merchandise.
- **Shop + Checkout**: merchandise catalog with variants, cart stored in localStorage, and secure server‑verified Stripe Payment Links checkout.

What This Project Accomplishes
------------------------------

- **Drives local discovery and conversions**: attractive, mobile‑first content and SEO metadata for a brick‑and‑mortar cafe.
- **Reduces staff workload**: owners can update hero images, popular drinks, and merchandise without code changes.
- **Engages customers**: AI quiz creates shareable, fun drink matches with a polished generated image card.
- **Monetizes brand**: simple online merchandise shop with frictionless Stripe checkout.
- **Operational safety**: server‑side validation of prices/stock and role‑gated admin access.

Key Features
------------

- **Internationalization**: cookie‑based locale detection; translations in `messages/{en,es,zh}.json`.
- **Hero slideshow**: `app/(site)/HeroSlideshow.tsx` reads slides from Firestore; admin can upload images and links.
- **Popular drinks**: grid and detail modal, optional video/story, dynamic price or size‑based pricing.
- **AI Personality Quiz**:
  - API: `app/api/personality-quiz/ai/route.ts` uses OpenAI (`gpt-4o-mini`) with strict output schema.
  - Server image generation: `app/api/personality-quiz/generate-image/route.ts` with `node-canvas` + branded fonts.
  - Client page: `app/(site)/personality-quiz/page.tsx` handles UX, constraints, sharing, and downloads.
- **Merch Shop**:
  - Product model supports single quantity or multiple variants (size/color/stock/price).
  - Cart context persisted to localStorage, with stock caps per variant or base inventory.
  - Checkout API: `app/api/checkout/create-payment-link/route.ts` builds Stripe Payment Links after server‑side price/stock validation.
- **Admin**:
  - Google Sign‑In via Firebase Auth, role check with Firestore `admins/{uid}` document.
  - Create/edit/delete popular drinks (single price or sizes), upload images/videos.
  - Create hero slides with ordering and optional links.
- **Analytics**: Firebase Analytics initialized client‑side only.

Tech Stack
----------

- **Framework**: Next.js 15 (App Router, Server/Client Components, Turbopack)
- **UI**: React 19, Tailwind CSS v4, Radix UI primitives, `lucide-react`
- **i18n**: `next-intl`
- **Data/Storage**: Firebase (Firestore, Storage, Auth, Analytics)
- **Payments**: Stripe (Payment Links API)
- **AI**: OpenAI SDK (chat completions)
- **Imaging**: `node-canvas` for server‑generated shareable images

Architecture Notes
------------------

- **Admin gating**: `app/(admin)/admin/layout.tsx` listens for Firebase Auth, checks `services/admins.isAdmin(uid)` against Firestore; only allowed users see admin UI.
- **Content storage**:
  - Hero slides: Firestore collection `heroSlides` + images on Firebase Storage.
  - Popular drinks: Firestore `popularDrinks` with optional `price` or `sizes[]`, optional `story`/`videoUrl`.
  - Shop items: Firestore `shopMerchandise` with optional `variants[]` and inventory counters.
- **Checkout hardening**: server reconstructs price/name from Firestore, validates stock and selected variants, and only then creates Stripe Payment Link (no client‑supplied price trust).
- **Static assets**: menu boards in `public/menu/*.webp`; logo in `public/angeltealogo.png`.
- **Internationalization**: locale resolved from cookie in `i18n/request.ts`; messages loaded per locale.

Directory Guide
---------------

- `app/(site)` – Public site routes, including homepage, quiz, and shop UI.
- `app/(admin)/admin` – Admin dashboard and upload/edit pages.
- `app/api` – API routes for AI quiz, checkout, chat, and utilities.
- `services/` – Firestore/Storage helpers for hero slides, popular drinks, shop items, admins.
- `types/` – Shared TypeScript models (`drink.ts`, `hero.ts`, `shop.ts`).
- `lib/firebase.ts` – Client‑safe Firebase init (Auth/Analytics guarded for browser).
- `lib/stripe.ts` – Stripe server SDK init.

Environment Variables
---------------------

Create `.env.local` with the following (examples):

```
# Firebase (client‑side keys are intended to be public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# OpenAI (server; do not expose publicly)
OPENAI_API_KEY=sk-...

# Stripe (server)
STRIPE_SECRET_KEY=sk_live_...

# Feature flags
NEXT_PUBLIC_SHOP_ACCESS=true
```

Getting Started (Local)
-----------------------

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add `.env.local` as above.
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

Admin Access
------------

1. Ensure Firebase project has a collection `admins` where each allowed admin has a document with `id = <firebase uid>`.
2. Visit `/admin`. Sign in with Google. Only users whose UID exists under `admins` are allowed into the dashboard.

Deploy Notes
------------

- Ensure environment variables are set in your hosting provider for Stripe and OpenAI (server‑only) and Firebase (public keys allowed client‑side).
- Verify Next.js `images.remotePatterns` in `next.config.ts` match your asset hosts (Unsplash, Firebase Storage, gstatic).
- Stripe API version is pinned in `lib/stripe.ts`. Keep it compatible with your account.

Security & Privacy Highlights
-----------------------------

- Server reconstructs product pricing and validates stock/variants before creating Stripe Payment Links.
- Admin UI is role‑restricted using Firebase Auth + Firestore allow‑list.
- OpenAI key is required server‑side; API responds with 500 if missing.

Business Outcomes
-----------------

- **Brand presence**: Beautiful, localized site improves discovery and trust.
- **Operational agility**: Non‑technical staff can update content quickly via admin.
- **Customer engagement**: AI quiz and shareable image drive social reach and return visits.
- **Revenue**: Merchandise storefront adds incremental sales with minimal overhead.

License
-------

Proprietary © Angel Tea. For internal or agreed use only.


