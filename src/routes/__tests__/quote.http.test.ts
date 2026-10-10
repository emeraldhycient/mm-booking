import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { FakeGeocoder } from '../../__tests__/fixtures/fake-geocoder.js';
import { API_KEY, bookingPayload, quotePayload } from '../../__tests__/fixtures/payloads.js';
import { createTestApp } from '../../__tests__/fixtures/test-app.js';
import { ApiError } from '../../errors/api-error.js';

function quote(app: Parameters<typeof request>[0], body: object = quotePayload()) {
  return request(app).post('/api/quote').set('x-api-key', API_KEY).send(body);
}

describe('POST /api/quote', () => {
  it('prices a trip and echoes the pins it used', async () => {
    const { app } = createTestApp();

    const response = await quote(app);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      price: {
        amount_rwf: 2018, currency: 'RWF', distance_km: 7.26, est_minutes: 14,
        breakdown: [
          { label: 'Base fare', amount_rwf: 600 },
          { label: '5 km × 200 (0–5 km)', amount_rwf: 1000 },
          { label: '2.26 km × 185 (5–10 km)', amount_rwf: 418 },
        ],
      },
      pins: {
        pickup: { lat: -1.93422, lng: 30.084892, source: 'geocoded', matched: 'KG 550 Street, Kicukiro' },
        dropoff: { lat: -1.929434, lng: 30.134337, source: 'geocoded', matched: 'KG 108 Street, Remera' },
      },
    });
  });

  it('uses pins the client sends instead of looking up addresses', async () => {
    const { app, geocoder } = createTestApp();

    const response = await quote(app, quotePayload({ restaurant_pin: '-1.95,30.06', receiver_pin: '34CQ+JF' }));

    expect(response.body.pins.pickup).toEqual({ lat: -1.95, lng: 30.06, source: 'provided', matched: null });
    expect(response.body.pins.dropoff.source).toBe('provided');
    expect(geocoder.calls).toEqual([]);
  });

  it('reports every invalid location field at once', async () => {
    const { app } = createTestApp();

    const response = await quote(app, quotePayload({ receiver_address: undefined, restaurant_pin: 'near the market' }));

    expect(response.status).toBe(422);
    expect(response.body.error.fields.map((issue: { field: string }) => issue.field).sort()).toEqual(['receiver_address', 'restaurant_pin']);
  });

  it('refuses a trip outside Kigali', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.quoteReply = { ok: true, inArea: false };

    const response = await quote(app);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('OUTSIDE_SERVICE_AREA');
  });

  it('names the address it could not place', async () => {
    const { app } = createTestApp({ geocoder: new FakeGeocoder({}) });

    const response = await quote(app);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('ADDRESS_NOT_FOUND');
  });

  it('answers 504 when the script does not reply', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.failures.quote = new ApiError('UPSTREAM_UNAVAILABLE');

    const response = await quote(app);

    expect(response.status).toBe(504);
  });

  it('passes a script refusal on as 502 with its message', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.quoteReply = { ok: false, error: 'Bad coordinate' };

    const response = await quote(app);

    expect(response.status).toBe(502);
    expect(response.body.error.message).toBe('Bad coordinate');
  });

  it('accepts a full booking payload and ignores the booking-only fields', async () => {
    const { app } = createTestApp();

    const response = await quote(app, bookingPayload());

    expect(response.status).toBe(200);
  });
});
