# movingman.online — booking page and client API

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

## Pricing lab

`/pricing-lab` serves the website's internal pricing lab, unchanged: `pricing-lab/` is a build of
`apps/website/pricing-lab` from the main product repo, not hand-edited source. It is unlisted, not
private — no login, an `X-Robots-Tag: noindex` header, a `robots.txt` disallow and no links, the same
rules as on the website. To refresh it after the lab changes, rebuild it from the main repo with the
owner's local `build-pricing-lab.mjs` script and commit the new `pricing-lab/` folder.

## Rollback

Point the `book` DNS record back to GitHub Pages. `index.html` on `main` is the same page GitHub Pages has always served.
