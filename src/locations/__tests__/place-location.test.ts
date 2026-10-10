import { describe, expect, it } from 'vitest';
import { FakeGeocoder } from '../../__tests__/fixtures/fake-geocoder.js';
import { FakeRouter } from '../../__tests__/fixtures/fake-router.js';
import { FakeScriptClient } from '../../__tests__/fixtures/fake-script-client.js';
import { RESTAURANT_ADDRESS } from '../../__tests__/fixtures/geocode-hits.js';
import { placeLocation } from '../place-location.js';

function deps(geocoder = new FakeGeocoder()) {
  return { scriptClient: new FakeScriptClient(), geocoder, router: new FakeRouter() };
}

describe('placeLocation', () => {
  it('uses a lat,lng pin as given, rounded to six decimals', async () => {
    const tools = deps();

    const pin = await placeLocation({ prefix: 'restaurant', address: 'anything', pin: '-1.93422049,30.0848921' }, tools);

    expect(pin).toEqual({ lat: -1.93422, lng: 30.084892, source: 'provided', matched: null });
    expect(tools.geocoder.calls).toEqual([]);
  });

  it('recovers a plus code pin', async () => {
    const pin = await placeLocation({ prefix: 'receiver', address: 'anything', pin: '34CQ+JF Kigali' }, deps());

    expect(pin).toMatchObject({ source: 'provided', matched: null });
    expect(pin.lat).toBeCloseTo(-1.928438, 5);
  });

  it('resolves a Google Maps link through the script', async () => {
    const tools = deps();

    const pin = await placeLocation({ prefix: 'receiver', address: 'anything', pin: 'https://maps.app.goo.gl/x' }, tools);

    expect(pin).toEqual({ lat: -1.95, lng: 30.06, source: 'provided', matched: null });
    expect(tools.scriptClient.calls.resolve).toEqual(['https://maps.app.goo.gl/x']);
  });

  it('names the pin field when a Maps link cannot be resolved', async () => {
    const tools = deps();
    tools.scriptClient.resolveReply = { ok: false, error: 'No location found in that link' };

    const attempt = placeLocation({ prefix: 'restaurant', address: 'anything', pin: 'https://maps.app.goo.gl/x' }, tools);

    await expect(attempt).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND', fields: [{ field: 'restaurant_pin' }] });
  });

  it('looks up the address when there is no pin', async () => {
    const pin = await placeLocation({ prefix: 'restaurant', address: RESTAURANT_ADDRESS }, deps());

    expect(pin).toEqual({ lat: -1.93422, lng: 30.084892, source: 'geocoded', matched: 'KG 550 Street, Kicukiro' });
  });

  it('falls back to the restaurant name when the address finds nothing', async () => {
    const geocoder = new FakeGeocoder({ 'Java House': { lat: -1.95, lng: 30.1, label: 'Java House, Kimihurura' } });

    const pin = await placeLocation({ prefix: 'restaurant', address: 'Unknown Road', fallback: 'Java House' }, deps(geocoder));

    expect(pin.matched).toBe('Java House, Kimihurura');
    expect(geocoder.calls).toEqual(['Unknown Road', 'Java House']);
  });

  it('names the address field when nothing matches', async () => {
    const attempt = placeLocation({ prefix: 'receiver', address: 'Nowhere Road' }, deps());

    await expect(attempt).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND', fields: [{ field: 'receiver_address' }] });
  });
});
