# book.movingman.online

The customer booking page (`index.html`, unchanged) and the client booking API.

- Spec: `docs/specs/2026-10-10-client-booking-api-design.md`
- Client API reference: `docs/api/booking-api.md`

## Local

```bash
npm ci
npm test
npm run typecheck
npm run build && npm run smoke
```

## Hostinger (Node.js Web App)

| Setting | Value |
|---|---|
| Node version | 22 |
| Build command | `npm run build` |
| Start command | `npm start` |
| Environment | `SCRIPT_URL` = the Apps Script **client API** deployment URL (ends in `/exec`) |

TypeScript and its two `@types` packages are regular dependencies so the build works even when Hostinger skips devDependencies.

The API sits behind Hostinger's proxy and trusts one proxy hop for client IPs. If every caller shares one rate limit, check `TRUST_PROXY_HOPS` in `src/constants/http.constant.ts`.

## Rollback

Point the `book` DNS record back to GitHub Pages. `index.html` on `main` is the same page GitHub Pages has always served.
