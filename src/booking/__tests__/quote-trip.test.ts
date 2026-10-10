import { describe, expect, it } from 'vitest';
import { FakeGeocoder } from '../../__tests__/fixtures/fake-geocoder.js';
import { FakeRouter } from '../../__tests__/fixtures/fake-router.js';
import { FakeScriptClient } from '../../__tests__/fixtures/fake-script-client.js';
import { quotePayload } from '../../__tests__/fixtures/payloads.js';
import { quoteRequestSchema } from '../../validation/booking-request.schema.js';
import { quoteTrip } from '../quote-trip.js';

function deps() {
  return { scriptClient: new FakeScriptClient(), geocoder: new FakeGeocoder(), router: new FakeRouter() };
}

const REQUEST = quoteRequestSchema.parse(quotePayload());

describe('quoteTrip', () => {
  it('places both pins, measures the road and asks the script for a price', async () => {
    const tools = deps();

    const trip = await quoteTrip(REQUEST, tools);

    expect(trip.route).toEqual({ km: 7.2601, mins: 14 });
    expect(trip.quote.fee).toBe(2018);
    expect(tools.scriptClient.calls.quote).toEqual([
      {
        from: expect.objectContaining({ lat: -1.93422, lng: 30.084892 }),
        to: expect.objectContaining({ lat: -1.929434, lng: 30.134337 }),
        route: { km: 7.2601, mins: 14 },
      },
    ]);
  });

  it('still quotes when OSRM has no route', async () => {
    const tools = deps();
    tools.router.result = null;

    await quoteTrip(REQUEST, tools);

    expect(tools.scriptClient.calls.quote[0]?.route).toBeNull();
  });

  it('refuses a trip the script says is outside the area', async () => {
    const tools = deps();
    tools.scriptClient.quoteReply = { ok: true, inArea: false };

    const attempt = quoteTrip(REQUEST, tools);

    await expect(attempt).rejects.toMatchObject({ code: 'OUTSIDE_SERVICE_AREA', status: 422 });
  });

  it('passes a script quote failure on as UPSTREAM_REJECTED', async () => {
    const tools = deps();
    tools.scriptClient.quoteReply = { ok: false, error: 'Bad coordinate' };

    const attempt = quoteTrip(REQUEST, tools);

    await expect(attempt).rejects.toMatchObject({ code: 'UPSTREAM_REJECTED', message: 'Bad coordinate' });
  });
});
