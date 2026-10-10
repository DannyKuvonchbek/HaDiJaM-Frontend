# HaDiJaM Frontend

HaDiJaM jewelry and atelier marketplace frontend built with Next.js Pages Router, TypeScript, Tailwind CSS, Material UI and Apollo Client.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Start the NestJS backend in `../Hadijam   backend` on port `9702`.
3. Run `npm install` and `npm run dev` here. The frontend uses port `1017` in development and when started with `npm run start` after a production build.

The homepage and collection page use the backend GraphQL `getProducts` query when products are available. Atelier services use `getServices`; sign in and account creation use `login` and `signup`; orders and service appointment requests use `createOrder` and `createServiceBooking`. When the catalogue is empty or the backend is offline, the storefront keeps a local set of sample pieces so the design can still be explored.

The frontend runs on port `1017`; its GraphQL API and uploaded media default to the backend at `http://localhost:2002`. Override `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_BASE_URL` in the deployment environment when the backend is hosted at another address.

Product and order prices are shown and entered in USD. The backend still stores numeric prices in UZS, so seller-entered USD amounts are converted using the latest USD rate from the Central Bank of Uzbekistan JSON feed; the app uses a documented fallback rate if that feed is unavailable.

Google and Facebook buttons on `/sign-in` redirect to `NEXT_PUBLIC_GOOGLE_OAUTH_URL` and `NEXT_PUBLIC_FACEBOOK_OAUTH_URL` when configured. The current NestJS backend does not expose provider OAuth endpoints, so these URLs must point to OAuth routes added to the authentication service before social sign-in can complete.

## Structure

- `pages/` — Next.js routes grouped by page area; each named route lives in that folder's `index.tsx` so its public URL stays the same (`pages/catalog/index.tsx` → `/catalog`)
- `libs/components/layout/` — shared site shell; `SiteHeader.tsx` owns the navigation and account menu, `SiteFooter.tsx` owns the footer, and `SiteLayout.tsx` combines them around each page
- `libs/components/homepage/` — homepage hero, categories, featured collection, partner, services, trust and review sections
- `libs/components/catalog/` — reusable catalogue and product-card UI
- `libs/components/account/` — My Account sidebar, tabs, profile, orders, saved pieces and order detail modal
- `libs/components/seller/` — seller product creation UI
- `libs/apollo/` and `libs/graphql/` — GraphQL client and operations matching the NestJS schema
- `libs/data/`, `libs/types/` and `libs/utils/` — sample content, shared TypeScript models and domain helpers
- `assets/reference/original-uploads/` — original user-provided image files retained as reference material; runtime images are under `public/images/`
- `public/images/stitch/` — imagery exported from the HaDiJaM Stitch project, organized by page area
- `scss/app.scss` — common style imports
- `scss/variables.scss` and `scss/reset.scss` — theme tokens and Tailwind/reset entry
- `scss/pc/main.scss` — desktop style imports grouped by page
- `scss/pc/**` — desktop styles for shared layout and each product area
- `scss/mobile/main.scss` — mobile and tablet overrides
- `tailwind.config.ts` and `postcss.config.js` — Tailwind theme and compiler setup

The homepage route is `pages/index.tsx`; its sections are composed there from `libs/components/homepage/`. The remaining route folders are `about/`, `cart/`, `catalog/`, `contact/`, `my-page/`, `order-confirmation/`, `product/`, `services/`, `seller/` and `sign-in/`. The Next.js special files `_app.tsx`, the homepage `index.tsx`, and the dynamic product route `[id].tsx` stay at their required route locations. Shared navigation and footer are in `libs/components/layout/`, so route files do not duplicate site-wide chrome. The Nestar project was used only as a read-only structure reference.

## Current storefront routes

- `/` — editorial homepage
- `/catalog` — searchable and category-filtered pieces
- `/product/[id]` — piece detail and add-to-bag
- `/cart` — delivery details and order creation
- `/order-confirmation` — concierge handover
- `/services` — atelier services and booking request
- `/sign-in` — member sign-in and registration
- `/about` — maison and guarantee information

The checkout currently creates an order in the backend. A payment provider/escrow settlement is not part of the current backend schema and needs its own integration before card payment can be offered.
