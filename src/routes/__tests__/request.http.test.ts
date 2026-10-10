import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { API_KEY, bookingPayload } from '../../__tests__/fixtures/payloads.js';
import { ORDER_REPLY_REPEAT, RECORDED_ROW } from '../../__tests__/fixtures/script-replies.js';
import { createTestApp } from '../../__tests__/fixtures/test-app.js';
import { ApiError } from '../../errors/api-error.js';

function book(app: Parameters<typeof request>[0], body: object = bookingPayload()) {
  return request(app).post('/api/request').set('x-api-key', API_KEY).send(body);
}

describe('POST /api/request', () => {
  it('books a delivery and returns the reference, price, pins and recorded row', async () => {
    const { app } = createTestApp();

    const response = await book(app);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ok: true,
      duplicate: false,
      booking_reference: 'MM-1010-A01',
      external_reference: 'DOS-10422',
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
      recorded: RECORDED_ROW,
    });
  });

  it('sends the script the order body built from the booking and the key', async () => {
    const { app, scriptClient } = createTestApp();

    await book(app);

    expect(scriptClient.calls.placeOrder).toHaveLength(1);
    expect(scriptClient.calls.placeOrder[0]).toMatchObject({ channel: 'api', op: 'order', apiKey: API_KEY, clientRef: 'DOS-10422' });
  });

  it('answers a repeat with 200 and the original booking', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.orderReply = ORDER_REPLY_REPEAT;

    const response = await book(app);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ duplicate: true, booking_reference: 'MM-1010-A01', price: { amount_rwf: 2018, breakdown: [] } });
  });

  it("answers a repeat with the pins it was booked with, not the retry's", async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.orderReply = ORDER_REPLY_REPEAT;

    const response = await book(app, bookingPayload({ restaurant_pin: '-1.95,30.06' }));

    expect(response.body.pins).toEqual({
      pickup: { lat: -1.93422, lng: 30.084892, source: 'recorded', matched: null },
      dropoff: { lat: -1.929434, lng: 30.134337, source: 'recorded', matched: null },
    });
  });

  it('books a retry that arrives after its pickup time has passed', async () => {
    const { app, scriptClient } = createTestApp();

    const response = await book(app, bookingPayload({ pickup_time: '2026-10-10T11:30:00Z' }));

    expect(response.status).toBe(201);
    expect(scriptClient.calls.placeOrder[0]).toMatchObject({ when: 'now', whenAt: '' });
  });

  it.each([
    ['paused', 503, 'NOT_ACCEPTING_ORDERS'],
    ['outside', 422, 'OUTSIDE_SERVICE_AREA'],
    ['disabled', 403, 'CLIENT_DISABLED'],
    ['Missing receiver details', 502, 'UPSTREAM_REJECTED'],
  ])('turns the script refusal %s into %i %s', async (scriptError, status, code) => {
    const { app, scriptClient } = createTestApp();
    scriptClient.orderReply = { ok: false, error: scriptError };

    const response = await book(app);

    expect(response.status).toBe(status);
    expect(response.body.error.code).toBe(code);
  });

  it('answers 504 and asks for a retry with the same reference when the order call times out', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.failures.placeOrder = new ApiError('UPSTREAM_UNAVAILABLE');

    const response = await book(app);

    expect(response.status).toBe(504);
    expect(response.body.error.message).toMatch(/same external_reference/);
  });

  it('refuses a reply that claims success without an order id', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.orderReply = { ok: true };

    const response = await book(app);

    expect(response.status).toBe(502);
    expect(response.body.error.message).toBe('The booking service did not return an order id.');
  });

  it('reports every invalid booking field at once without calling the script', async () => {
    const { app, scriptClient } = createTestApp();

    const response = await book(app, bookingPayload({ receiver_phone: '123', pickup_time: 'later today', external_reference: undefined }));

    expect(response.status).toBe(422);
    expect(response.body.error.fields.map((issue: { field: string }) => issue.field).sort()).toEqual(['external_reference', 'pickup_time', 'receiver_phone']);
    expect(scriptClient.calls.quote).toEqual([]);
    expect(scriptClient.calls.placeOrder).toEqual([]);
  });

  it('does not book a trip the quote finds outside the area', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.quoteReply = { ok: true, inArea: false };

    const response = await book(app);

    expect(response.status).toBe(422);
    expect(scriptClient.calls.placeOrder).toEqual([]);
  });

  it('logs the booking without personal details', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { app } = createTestApp();

    await book(app);

    const entry = String(log.mock.calls[0]?.[0]);
    expect(JSON.parse(entry)).toEqual({ level: 'info', event: 'booking', client: 'CL-001', orderId: 'MM-1010-A01', duplicate: false });
    expect(entry).not.toContain('0780000004');
  });
});
