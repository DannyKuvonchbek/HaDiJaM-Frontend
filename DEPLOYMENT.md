# HaDiJaM frontend deployment

## Build and run

Use Node.js 20 or newer. Set the public backend URLs before building because `NEXT_PUBLIC_*` values are embedded in the browser bundle:

```env
NEXT_PUBLIC_API_URL=https://api.hadijam.com/graphql
NEXT_PUBLIC_API_BASE_URL=https://api.hadijam.com
NEXT_PUBLIC_GOOGLE_OAUTH_URL=
NEXT_PUBLIC_FACEBOOK_OAUTH_URL=
```

Then run `npm ci`, `npm run build`, and `npm run start`. The app listens on port `1017`; terminate TLS at the reverse proxy and forward requests to this port. Keep the API and frontend on HTTPS in production.

Google/Facebook sign-in remains unavailable until the matching OAuth endpoints are implemented and these URLs are configured. Never put private API keys in `NEXT_PUBLIC_*` variables.

## Release checks

- Confirm the backend GraphQL and upload URLs are reachable from the public site.
- Test sign-in, sign-up, product browsing, cart, checkout, service booking, file upload, and My Page against the production API.
- Checkout currently records an order; it does not charge a payment card. Do not present it as a completed payment until a payment provider is integrated.
- The project has no ESLint dependency/configuration yet. `npm run build` performs Next.js production compilation and TypeScript validation; configure ESLint separately if lint enforcement is required.
