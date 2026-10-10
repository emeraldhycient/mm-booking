# Moving Man booking API

Book Moving Man bike deliveries in Kigali from your own system.

Base URL: `https://book.movingman.online`
Authentication: send your key in the `X-API-Key` header on every request. Keep it on your server; never put it in an app or web page.

## POST /api/quote — price only

Same body as a booking, but only these fields are read: `booking_company`, `restaurant_name`, `restaurant_address`, `restaurant_pin`, `receiver_address`, `receiver_pin`. Nothing is booked.

## POST /api/request — book a delivery

```json
{
  "booking_company": "Dosteon",
  "external_reference": "DOS-10422",
  "restaurant_name": "Java House Kimihurura",
  "restaurant_address": "KG 7 Ave, Kimihurura",
  "restaurant_phone": "0781234567",
  "restaurant_pin": "-1.9536,30.0606",
  "item_type": "Food",
  "receiver_name": "Aline U.",
  "receiver_address": "KG 108 Street, Remera",
  "receiver_phone": "0789876543",
  "receiver_pin": "34CM+6P Kigali",
  "pickup_time": "2026-10-10T14:30",
  "payer": "sender",
  "pay_method": "account",
  "size": "small",
  "notes": "Ring at the gate"
}
```

| Field | Required | Rules |
|---|---|---|
| `booking_company` | yes | Your business name, as registered with us |
| `external_reference` | yes | Your own order id; 1–40 of letters, digits, `.`, `_`, `-`. Re-sending it returns the original booking instead of a second one |
| `restaurant_name` | yes | 2–60 characters |
| `restaurant_address` | yes | 2–80 characters |
| `restaurant_phone` | no | Rwandan mobile; we use your dispatch number if absent |
| `restaurant_pin`, `receiver_pin` | no | `lat,lng`, a Google Maps link, or a plus code. Strongly recommended — without a pin we look the address up, which can miss |
| `item_type` | yes | `Food`, `Documents`, `Clothes`, `Laundry`, `Electronics` or `Other` |
| `receiver_name` | yes | 2–60 characters |
| `receiver_address` | yes | 2–80 characters |
| `receiver_phone` | yes | Rwandan mobile, e.g. `078 123 4567` or `+250781234567` |
| `pickup_time` | yes | `"now"`, or ISO-8601. Without an offset it is Kigali time. At most 30 days ahead. A time up to 2 hours in the past is treated as now, so a late retry still goes through; anything older is refused |
| `payer` | yes | `sender` or `receiver` |
| `pay_method` | yes | `momo`, `cash` or `account` (`account` = billed to you; needs `payer: sender`) |
| `size` | no | `small` (default) or `medium`. Our riders are on bikes |
| `notes` | no | Up to 200 characters for the rider |

Empty strings and `null` in optional fields count as absent.

### Success

`201 Created` for a new booking, `200 OK` when `external_reference` was already booked (`"duplicate": true`).

```json
{
  "ok": true,
  "duplicate": false,
  "booking_reference": "MM-1010-A01",
  "external_reference": "DOS-10422",
  "price": { "amount_rwf": 2018, "currency": "RWF", "distance_km": 7.26, "est_minutes": 14, "breakdown": [ … ] },
  "pins": {
    "pickup":  { "lat": -1.9536, "lng": 30.0606, "source": "provided", "matched": null },
    "dropoff": { "lat": -1.929434, "lng": 30.134337, "source": "provided", "matched": null }
  },
  "recorded": { "Order ID": "MM-1010-A01", "Customer / Business": "Dosteon", "…": "…" }
}
```

- `booking_reference` is the id our team uses; quote it when you call us.
- Prices are whole Rwandan francs. On a repeat, `breakdown` is empty.
- Check `pins`: when `source` is `geocoded`, `matched` shows the place we found.
- A repeat returns the original booking unchanged, and its `pins` are the ones it was booked with (`source: "recorded"`). Resending with different details does not change a booking — call us to change one.
- `recorded` is the booking exactly as our team sees it.

### Errors

`{ "ok": false, "error": { "code": "…", "message": "…", "fields": [ { "field": "…", "message": "…" } ] } }` — `fields` appears for validation and address errors.

| HTTP | Code | What to do |
|---|---|---|
| 400 | `INVALID_JSON` | Send a JSON object with `Content-Type: application/json`, under 10 kB |
| 401 | `UNAUTHORIZED` | Check your key |
| 403 | `CLIENT_DISABLED` | Contact us |
| 403 | `COMPANY_MISMATCH` | `booking_company` must be your registered name |
| 404 | `NOT_FOUND` | Check the URL |
| 422 | `VALIDATION_FAILED` | Fix the listed fields |
| 422 | `ADDRESS_NOT_FOUND` | Send a pin for the listed field |
| 422 | `OUTSIDE_SERVICE_AREA` | We only deliver inside Kigali |
| 429 | `RATE_LIMITED` | Over 30 requests a minute; wait and retry |
| 503 | `NOT_ACCEPTING_ORDERS` | We have paused bookings; try later |
| 502 | `UPSTREAM_REJECTED` | Read `message`; contact us if it repeats |
| 504 | `UPSTREAM_UNAVAILABLE` | Retry with the **same** `external_reference` |
| 500 | `INTERNAL` | Contact us |

### Timeouts and retries

A booking can take up to a minute when a map service is slow. Use a 60-second timeout. On a timeout or any 5xx, retry with the same `external_reference` — you will get the original booking, never a second rider.

### Example

```bash
curl -X POST https://book.movingman.online/api/request \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MOVING_MAN_API_KEY" \
  -d @booking.json
```
