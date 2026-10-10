# Client booking API — design

**Date:** 2026-10-10 · **Status:** awaiting owner review · **First client:** Dosteon

## 1. Purpose

Let a business client (first: Dosteon, a restaurant-delivery company) book Moving Man bike deliveries
from its own system, without WhatsApp. The client sends one JSON request and gets back the price, the
booking reference ops will use, and the row as it was written to the Requests sheet.

This is a stopgap until the main platform backend replaces the sheet. It must not change anything the
current customer website does.

### Success criteria

- `POST https://book.movingman.online/api/request` books a delivery and returns price, booking
  reference and the recorded row.
- `POST https://book.movingman.online/api/quote` prices the same payload without booking.
- Ops issues, disables and rotates client keys from an **API Clients** tab in the sheet — no deploy.
- The customer page at `https://book.movingman.online/` is byte-for-byte unchanged and keeps working
  throughout, including during the DNS move.
- Web bookings behave exactly as today — proven by a side-by-side test (§7.2).
- A client retry never creates a second order.

## 2. What exists today

| Piece | Where | Role |
|---|---|---|
| Booking page | `index.html` in this repo, GitHub Pages, `CNAME` = `book.movingman.online` | Pins, price, WhatsApp hand-off |
| Booking backend | Google Apps Script bound to the sheet "Moving Man — Booking Requests" | `GET ?action=quote / resolve / ping`, `POST` order → appends to **Requests**, emails ops |
| Rates & settings | **Rates** and **Settings** tabs of that sheet | Stepped fare, service-area box, pause switch, alert emails |

Pricing lives only in the Rates tab and the script's `fare_()`. Nothing in this design re-implements it.

## 3. Architecture

```
Dosteon ──HTTPS──▶ Hostinger Node app (book.movingman.online)
                     ├─ GET  /              → index.html, unchanged
                     ├─ POST /api/quote     ┐ check key · validate · place pins (Photon / script resolve)
                     └─ POST /api/request   ┘ road distance (OSRM) · call script
                                 │
                                 ▼
                 Apps Script — NEW deployment (extended code) ──▶ same sheet (+ API Clients, API Refs tabs)
Customer phone ─▶ Apps Script — EXISTING deployment (old version, untouched) ──▶ same sheet
```

- **Host:** Hostinger Business/Cloud plan, Node.js Web App deployed from this repo.
- **Stack:** Node 22, TypeScript, Express 5, zod, Vitest + Supertest. Express is enough; Next.js adds a
  build and nothing this needs.
- **The page is not moved or edited.** Express sends `index.html` for `/` only (no directory static
  serving, so source files are never exposed). Because the file stays in place, GitHub Pages keeps
  serving the live site until DNS moves, and pointing DNS back is the rollback.
- **Two script deployments, one project.** The website's deployment stays pinned to its current
  version, so the code it runs does not change. The extended version gets a new web-app deployment whose
  `/exec` URL only the Hostinger app uses. Both share the sheet, the script lock and Script Properties.
- **The sheet is the source of truth for clients.** Hostinger holds no keys; it asks the script.

## 4. API contract

### 4.1 Authentication and clients

Clients live in a new **API Clients** tab:

| Client ID | Business Name | API Key | Dispatch Phone | Active | Created At | Notes |
|---|---|---|---|---|---|---|
| `CL-001` | Dosteon | `mm_` + 32 hex | `078…` | ☑ | 2026-10-10 15:02:11 | free text, ignored |

- Ops adds a row with Business Name and Dispatch Phone, then runs the sheet menu **API clients → Issue
  missing keys** (§6.3), which fills Client ID, API Key and Created At for rows that lack them. The key
  is a random UUID from the script, without dashes, prefixed `mm_`.
- **Disable:** untick Active. **Rotate:** clear the API Key cell and run the menu again.
- The client sends `X-API-Key: <key>`. Hostinger asks the script who owns it (§5 step 1) and caches the
  answer for 60 s, so a change in the tab takes effect within a minute.
- `booking_company` must equal the client's Business Name (case-insensitive), else `403 COMPANY_MISMATCH`.
- Rate limits: 30 requests per minute per key per endpoint, and 60 per minute per IP across `/api/*`
  (so random keys cannot hammer the script) → `429 RATE_LIMITED`.
- Server-to-server only; no CORS headers are sent.

### 4.2 Request body

JSON, max 10 kB. `/api/request` uses every field; `/api/quote` uses only the starred (★) ones.

| Field | Required | Rule | Lands in sheet as |
|---|---|---|---|
| `booking_company` ★ | yes | matches the client's Business Name | Customer / Business |
| `external_reference` | yes | 1–40 chars, `A-Z a-z 0-9 . _ -` — the client's own order id | Notes, API Refs tab |
| `restaurant_name` ★ | yes | 2–60 chars | Pickup Contact |
| `restaurant_address` ★ | yes | 2–80 chars | Pickup Area |
| `restaurant_phone` | no | Rwandan mobile; defaults to the client's Dispatch Phone | Pickup Phone |
| `restaurant_pin` ★ | no | see §4.3 | Pickup Lat,Lng / Pin / Map |
| `item_type` | yes | `Food`, `Documents`, `Clothes`, `Laundry`, `Electronics`, `Other` (any case) | Item |
| `receiver_name` | yes | 2–60 chars | Drop Contact |
| `receiver_address` ★ | yes | 2–80 chars | Drop Area |
| `receiver_phone` | yes | Rwandan mobile | Drop Phone |
| `receiver_pin` ★ | no | see §4.3 | Drop Lat,Lng / Pin / Map |
| `pickup_time` | yes | `"now"`, or ISO-8601; no offset = Kigali time; ≤ 30 days ahead; up to 2 h in the past counts as now (so a late retry reaches the duplicate check), older is refused | Requested Pickup (`ASAP` or `YYYY-MM-DD HH:mm`) |
| `payer` | yes | `sender` \| `receiver` | Paid By |
| `pay_method` | yes | `momo` \| `cash` \| `account`; `account` requires `payer: sender` | Pay Method |
| `size` | no | `small` (default) \| `medium` — bikes only, so no `large` | Size |
| `notes` | no | ≤ 200 chars | Notes, after `Ref <external_reference>` |

Customer Phone is always the client's Dispatch Phone. A Rwandan mobile is the script's own rule: digits
only, optional `250`/`0` prefix, then `7[2389]` + 7 digits; it is stored as `07XXXXXXXX`. Length limits
match where the script truncates, so nothing is silently cut. Every failing field is reported at once.

### 4.3 Placing the two addresses

Pricing needs exact coordinates. Each location is placed in this order:

1. `*_pin` is `lat,lng` → used as given.
2. `*_pin` is a Google Maps link (long or `maps.app.goo.gl`) → the script's existing `?action=resolve`.
3. `*_pin` is a plus code (full or short, e.g. `34CQ+JF`) → recovered locally against central Kigali.
4. No pin → the address text is searched on Photon inside the Kigali box (same search as the page). For
   the restaurant, the restaurant name is tried if the address finds nothing.

Coordinates are rounded to 6 decimals, as the page does. A location that cannot be placed gives
`422 ADDRESS_NOT_FOUND` with the field. Every response echoes the pin used and whether it was provided or
looked up, so the client can spot a wrong match. Looked-up pins are approximate; clients are told to send
pins when they have them.

### 4.4 Responses

`POST /api/request` → `201` (new) or `200` (repeat of an earlier `external_reference`, `duplicate: true`):

```json
{
  "ok": true,
  "duplicate": false,
  "booking_reference": "MM-1010-A01",
  "external_reference": "DOS-10422",
  "price": {
    "amount_rwf": 2018, "currency": "RWF", "distance_km": 7.26, "est_minutes": 14,
    "breakdown": [
      { "label": "Base fare", "amount_rwf": 600 },
      { "label": "5 km × 200 (0–5 km)", "amount_rwf": 1000 },
      { "label": "2.26 km × 185 (5–10 km)", "amount_rwf": 418 }
    ]
  },
  "pins": {
    "pickup":  { "lat": -1.93422,  "lng": 30.084892, "source": "geocoded", "matched": "KG 550 Street, Kicukiro" },
    "dropoff": { "lat": -1.929434, "lng": 30.134337, "source": "provided", "matched": null }
  },
  "recorded": { "Order ID": "MM-1010-A01", "Date": "10/10/2026", "Customer / Business": "Dosteon", "…": "…", "Source": "API · Dosteon" }
}
```

- `booking_reference` is the script's Order ID — the id ops sees in the sheet and the alert email.
- `price` is what the script charged when it wrote the row, not a separate estimate. On a duplicate it
  is read from the original row (Fare RWF, Distance km, Est. Minutes) and `breakdown` is empty, because
  the original breakdown is not stored. Its `pins` also come from the original row (`source: "recorded"`),
  never from the retry, so a resend with different pins cannot look like a change.
- `recorded` is the written row read back from the sheet (display values), keyed by the script's column
  names (`REQUEST_HEADERS`). Values are as the sheet shows them, e.g. phones without the leading 0.

`POST /api/quote` → `200` with `ok`, `price` and `pins` only. It writes no order; the script logs it to
the Quotes tab exactly as it logs the page's quotes.

A booking can take up to about a minute when Google is slow; clients should allow 60 s and, on a timeout
or 5xx, retry with the same `external_reference`.

### 4.5 Errors

Every error: `{ "ok": false, "error": { "code": "…", "message": "…", "fields": [{ "field": "…", "message": "…" }] } }`
(`fields` on validation and address errors).

| HTTP | Code | When |
|---|---|---|
| 400 | `INVALID_JSON` | Body is not JSON or is over 10 kB |
| 401 | `UNAUTHORIZED` | Missing `X-API-Key`, or no API Clients row has it |
| 403 | `CLIENT_DISABLED` | The key's row has Active unticked |
| 403 | `COMPANY_MISMATCH` | `booking_company` is not the client's Business Name |
| 422 | `VALIDATION_FAILED` | Any field rule in §4.2 |
| 422 | `ADDRESS_NOT_FOUND` | A location cannot be placed (§4.3) |
| 422 | `OUTSIDE_SERVICE_AREA` | Script says a pin is outside the Settings box |
| 429 | `RATE_LIMITED` | Over a limit in §4.1 |
| 503 | `NOT_ACCEPTING_ORDERS` | Settings → `ACCEPTING_ORDERS` is `FALSE` |
| 502 | `UPSTREAM_REJECTED` | Script returned any other `ok: false`; message passed through |
| 504 | `UPSTREAM_UNAVAILABLE` | Script, Photon or OSRM still failing after retries |
| 404 | `NOT_FOUND` | No such `/api` endpoint |
| 500 | `INTERNAL` | Our fault, or a client row with no valid Dispatch Phone (logged) |

## 5. Request flow

1. **Client.** Rate-limit by IP, then look up the key: `POST <script>` `{ channel:'api', op:'client',
   apiKey }` → `{ ok:true, client:{ id, name, dispatchPhone } }` or `unauthorized` / `disabled`. Cached
   60 s, including "not found". Then rate-limit by key and check `booking_company`.
2. Validate the body (§4.2).
3. Place both pins (§4.3).
4. Road distance from `routing.openstreetmap.de` (same OSRM server and request as the page), 8 s limit.
   On failure, continue without it and the script falls back to Google.
5. **Quote:** `GET <script>?action=quote&pLat&pLng&dLat&dLng[&rk&rm]` — 10 s limit, 3 tries.
   `inArea: false` → `422 OUTSIDE_SERVICE_AREA`. `/api/quote` stops here.
6. **Book** (`/api/request` only): `POST <script>` with `Content-Type: text/plain`:

   ```json
   { "channel": "api", "op": "order", "apiKey": "mm_…", "clientRef": "DOS-10422",
     "pickup":  { "lat": -1.93422, "lng": 30.084892, "name": "<restaurant_address>", "note": "" },
     "drop":    { "lat": -1.929434, "lng": 30.134337, "name": "<receiver_address>", "note": "" },
     "size": "Small", "when": "later", "whenAt": "2026-10-10T14:30",
     "handover": { "type": "other", "name": "<restaurant_name>", "phone": "<restaurant or dispatch phone>" },
     "receiver": { "name": "…", "phone": "07…" },
     "customer": { "name": "<Business Name>", "phone": "<Dispatch Phone>" },
     "details":  { "item": "Food", "weight": "", "fragile": false, "payer": "Sender", "payMethod": "Account",
                   "notes": "Ref DOS-10422 · <notes>" },
     "route":    { "km": 7.26, "mins": 14 } }
   ```

   This is the page's own order body plus `channel`, `op`, `apiKey`, `clientRef`. 25 s limit, 2 tries on
   timeout or network error — safe because the script de-duplicates on `clientRef` (§6.2). Apps Script
   answers a POST with a 302 to its echo URL; `fetch` follows it as a GET, which is what that URL needs.
7. Map the script's reply to §4.4 or §4.5.

## 6. Apps Script extension

### 6.1 The only change to the existing `Code.gs`

One line at the top of `doPost`, before its `try`; the rest of the function is untouched:

```js
function doPost(e) {
  var api = apiBody_(e); if (api) return json_(apiPost_(api));
  try {
    // …existing code, unchanged…
```

`apiBody_` never throws. It returns the parsed body only when `channel === 'api'`, and `null` for
anything else — including bodies that are not JSON, which then reach the existing code exactly as before.

### 6.2 New file `Api.gs`

`apiPost_(body)` wraps everything in its own `try`/`catch` and keeps the script's `{ ok:false, error }`
shape. It first finds the client: the API Clients row whose API Key equals `body.apiKey` (no match →
`unauthorized`; Active unticked → `disabled`). Then it dispatches on `body.op`:

**`op: 'client'`** → `{ ok:true, client:{ id, name, dispatchPhone } }`.

**`op: 'order'`:**

1. **Clean.** Reuses the existing `cleanOrder_()` unchanged; `clientRef` is required.
2. **Repeat?** Look up (Client ID, `clientRef`) in a new **API Refs** tab (`Client ID, Client Ref, Order
   ID, Created At`). Found → read that order's Requests row and return it with `duplicate: true`. No new
   row, no email — a retry gets its original order even if bookings are paused.
3. **Pause.** Settings → `ACCEPTING_ORDERS` = `FALSE` → `{ ok:false, error:'paused' }`.
4. **Price.** Existing `quote_()` with `body.route` as the hint (logging off), outside the lock.
   `inArea: false` → `{ ok:false, error:'outside' }`.
5. **Under the existing script lock:** repeat the API Refs check (two identical requests racing), then
   - new Order ID `MM-ddMM-A##` from its own Script Property counter `seqA_ddMM`, so API ids never
     collide with web (`W`) or manual ids;
   - append the row in `REQUEST_HEADERS` order, built as `doPost` builds it except **Type = `B2B`** and
     **Source = `API · <Business Name>`**, with the same `safeCell_()` escaping;
   - append the API Refs row; read the new Requests row back as display values.
6. **Alert.** Existing `sendAlert_()` unchanged — ops gets the same email as for a web booking.
7. Return `{ ok:true, duplicate, orderId, fee, km, mins, base, lines, row: { <header>: <display value> } }`.

**Sheet menu.** An `onOpen` simple trigger adds **API clients → Issue missing keys**: for each API
Clients row with a Business Name, fill a blank Client ID (`CL-` + next 3-digit number), API Key and
Created At. `setupApi()`, run once from the editor, creates the API Clients and API Refs tabs with
`ensureSheet_()` and makes Active a checkbox column. Menus and setup only touch the sheet's UI and the two
new tabs; neither is reachable from the website.

Nothing in `Api.gs` is called by the web path.

### 6.3 Shipping it without touching the website

In the Apps Script editor (owner):

1. Add `Api.gs`; add the one line to `doPost`; save.
2. Run `setupApi()` once and approve permissions. Reload the sheet so the menu appears.
3. In **API Clients**, add `Dosteon` with its dispatch phone; run **API clients → Issue missing keys**.
4. **Deploy → New deployment** → Web app · Execute as: Me · Who has access: Anyone. Copy its `/exec`
   URL for Hostinger.
5. **Do not edit the existing deployment.** The page's `SCRIPT_URL` keeps serving the old version.

**The script never goes into this repo.** It is written and tested in a separate local workspace,
`mm-booking-script/`, beside this repo and never pushed. The owner receives `Api.gs` plus the one-line
`doPost` change and pastes them into the Apps Script editor.

## 7. Testing

Test-first throughout. One behaviour per test, names read as sentences.

### 7.1 Hostinger app

- **Unit:** request validation, phone normalising, pin parsing (lat,lng · Maps link routing · plus
  code), Kigali-time pickup formatting, request → script body mapping, script reply → response mapping,
  client-lookup caching (hit, miss, expiry, negative result).
- **HTTP (Supertest):** every status code in §4.5 through the real Express pipeline; the script, Photon
  and OSRM replaced by in-process fakes built from their real reply shapes; key, disabled-client and
  company checks proven over HTTP; `GET /` returns `index.html` byte-for-byte.
- At least one test pins a known served figure to its expected output (e.g. 7.26 km → 2018 RWF from the
  script reply) rather than to a constant in our own code.

### 7.2 Apps Script

These tests live in the local `mm-booking-script/` workspace with the script, not in this repo. The
`.gs` files run in a Node `vm` context with in-memory stand-ins for `SpreadsheetApp`, `LockService`,
`PropertiesService`, `CacheService`, `MailApp`, `UrlFetchApp`, `Maps`, `Utilities` and `ContentService`.

- **Website unchanged (characterisation):** the deployed `Code.gs` (kept as a local fixture) and the extended
  `Code.gs + Api.gs` each receive the same web bodies — draft, confirm, paused, outside, missing receiver,
  malformed JSON — and must produce identical replies, Requests rows, Quotes rows, emails and Order ids.
- **API path:** unknown key refused; disabled client refused; `op:'client'` returns the row; paused;
  outside; B2B row with `A` id and `API · Dosteon` source; route hint used; repeat `clientRef` returns the
  same order with no second row or email, also while paused; API Refs row written; reply carries the
  read-back row.
- **Menu:** issues a key, Client ID and Created At only where blank; leaves existing keys alone.

### 7.3 Live check (before Dosteon gets a key)

On Hostinger's temporary address: the page loads and quotes; `/api/quote` returns a price; then 1–2
bookings named **"API TEST — ignore"**, made only after the owner says go at that moment, using a test
row in API Clients. The owner deletes those rows from Requests and API Refs, and the test client row,
afterwards.

## 8. Configuration

| Where | Name | Value |
|---|---|---|
| Hostinger env | `SCRIPT_URL` | the new deployment's `/exec` URL |
| Sheet | **API Clients** tab | one row per client (§4.1) |

Technical values (timeouts, retries, rate limits, cache TTL, field limits, item list, Kigali search box,
OSRM/Photon URLs) are named constants. Business values stay where they are today: fares in Rates, service
area and pause switch in Settings, clients in API Clients. The search box only biases Photon; the
script's area check decides.

## 9. Rollout

1. PR from `client-booking-api` into `main` of `dduru26/mm-booking`.
2. Owner pastes `Api.gs` and the `doPost` line into the Apps Script editor and ships them (§6.3).
3. Hostinger hPanel → Add Website → Node.js Web App → import this repo from the `client-booking-api`
   branch; set `SCRIPT_URL`. The GitHub account connected to Hostinger needs access to
   `dduru26/mm-booking`.
4. Live check (§7.3) on the temporary address.
5. Merge; switch Hostinger to deploy from `main`. GitHub Pages still serves the same unchanged
   `index.html`.
6. DNS: point `book` at Hostinger and attach the domain there. Keep GitHub Pages enabled as the
   rollback for a week, then remove it and `CNAME`.
7. Hand Dosteon the API doc (`docs/api/booking-api.md`) and their key.

## 10. Risks and known limits

- **Keys are plain text in the sheet.** Anyone who can open "Moving Man — Booking Requests" can read
  them. Keep the sheet's sharing to ops; rotate a key by clearing it and re-issuing (§4.1).
- **Wrong look-ups.** Photon can match the wrong place. Mitigated by echoing pins; clients should send
  pins. A wrong pin gives a wrong price and a rider at the wrong door.
- **Shared public services.** Photon and the FOSSGIS OSRM server are free, fair-use services; fine at
  this volume. The script already falls back to Google for distance.
- **Apps Script limits.** Calls take seconds; daily quotas apply to email and URL fetches. The current
  triple-recording of web orders (§11) also triples email use until it is fixed.
- **Public repo.** `dduru26/mm-booking` is public. The script source stays out of it (§6.3), but this
  spec, which describes the script's behaviour, becomes public. No key or secret is ever committed; the
  script URL is already public in `index.html`.
- **Pins are rounded to 6 decimals** before quoting so the script's route cache key matches.

## 11. Out of scope (separate changes)

- **Duplicate web orders — next change after this ships.** Today every web booking is recorded about
  three times: the page posts drafts and a reconcile re-post (its `?action=status` check does not exist in
  the script), and the script ignores `stage`. Fix: the script ignores drafts and answers `status`; shipped
  by moving the website's deployment to that version.
- **Stale header row in Requests** — "Created At" sits in column B but the script writes it second-to-last
  (column AH). An ops edit to the header row, no code.
- Order status, cancellation or webhooks back to the client; multi-drop; items too large for a bike;
  collecting payment.
