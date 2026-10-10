import { describe, expect, it } from 'vitest';
import { FIXED_NOW, API_KEY, bookingPayload } from '../../__tests__/fixtures/payloads.js';
import { DOSTEON, QUOTE_7_26_KM, ROAD_7_26_KM } from '../../__tests__/fixtures/script-replies.js';
import type { BookingRequest } from '../../types/booking-request.type.js';
import type { QuotedTrip } from '../../types/quoted-trip.type.js';
import { createBookingRequestSchema } from '../../validation/booking-request.schema.js';
import { buildOrderBody } from '../build-order-body.js';

const TRIP: QuotedTrip = {
  pickup: { lat: -1.93422, lng: 30.084892, source: 'geocoded', matched: 'KG 550 Street, Kicukiro' },
  dropoff: { lat: -1.929434, lng: 30.134337, source: 'provided', matched: null },
  route: ROAD_7_26_KM,
  quote: QUOTE_7_26_KM,
};

function booking(overrides: Record<string, unknown> = {}): BookingRequest {
  return createBookingRequestSchema(FIXED_NOW).parse(bookingPayload(overrides));
}

describe('buildOrderBody', () => {
  it("builds the booking page's order body for the script from a booking", () => {
    const body = buildOrderBody({ request: booking(), client: DOSTEON, apiKey: API_KEY, trip: TRIP });

    expect(body).toEqual({
      channel: 'api',
      op: 'order',
      apiKey: API_KEY,
      clientRef: 'DOS-10422',
      pickup: { lat: -1.93422, lng: 30.084892, name: 'KG 550 Street, Kicukiro', note: '' },
      drop: { lat: -1.929434, lng: 30.134337, name: 'KG 108 Street, Remera', note: '' },
      size: 'Small',
      when: 'later',
      whenAt: '2026-10-10T16:30',
      handover: { type: 'other', name: 'Test Restaurant', phone: '0780000003' },
      receiver: { name: 'Test Receiver', phone: '0780000004' },
      customer: { name: 'Dosteon', phone: '0780000009' },
      details: { item: 'Food', weight: '', fragile: false, payer: 'Sender', payMethod: 'Account', notes: 'Ref DOS-10422 · Ring at the gate' },
      route: { km: 7.2601, mins: 14 },
    });
  });

  it('falls back to the dispatch phone when there is no restaurant phone', () => {
    const body = buildOrderBody({ request: booking({ restaurant_phone: undefined }), client: DOSTEON, apiKey: API_KEY, trip: TRIP });

    expect(body.handover.phone).toBe('0780000009');
  });

  it('writes only the reference when there are no notes', () => {
    const body = buildOrderBody({ request: booking({ notes: undefined }), client: DOSTEON, apiKey: API_KEY, trip: TRIP });

    expect(body.details.notes).toBe('Ref DOS-10422');
  });

  it('sends a null route when OSRM had none', () => {
    const body = buildOrderBody({ request: booking(), client: DOSTEON, apiKey: API_KEY, trip: { ...TRIP, route: null } });

    expect(body.route).toBeNull();
  });

  it('sends an as-soon-as-possible pickup as now with no time', () => {
    const body = buildOrderBody({ request: booking({ pickup_time: 'now' }), client: DOSTEON, apiKey: API_KEY, trip: TRIP });

    expect([body.when, body.whenAt]).toEqual(['now', '']);
  });

  it('labels a receiver paying cash the way the web page does', () => {
    const body = buildOrderBody({ request: booking({ payer: 'receiver', pay_method: 'cash', size: 'medium' }), client: DOSTEON, apiKey: API_KEY, trip: TRIP });

    expect([body.details.payer, body.details.payMethod, body.size]).toEqual(['Receiver', 'Cash', 'Medium']);
  });
});
