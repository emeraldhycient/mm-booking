import { describe, expect, it } from 'vitest';
import { recordingFetchJson } from '../../__tests__/fixtures/recording-fetch-json.js';
import { createOsrmRouter } from '../osrm-router.js';

const PICKUP = { lat: -1.93422, lng: 30.084892 };
const DROP = { lat: -1.929434, lng: 30.134337 };

describe('the OSRM router', () => {
  it('asks OSRM for the car route with longitude first, like the booking page', async () => {
    const { calls, fetchJson } = recordingFetchJson({ code: 'Ok', routes: [{ distance: 7260, duration: 840 }] });

    await createOsrmRouter(fetchJson).route(PICKUP, DROP);

    expect(calls[0]![0]).toBe(
      'https://routing.openstreetmap.de/routed-car/route/v1/driving/30.084892,-1.93422;30.134337,-1.929434?overview=false&steps=false',
    );
  });

  it('converts metres to km and seconds to whole minutes rounded up', async () => {
    const { fetchJson } = recordingFetchJson({ code: 'Ok', routes: [{ distance: 7260, duration: 801 }] });

    const route = await createOsrmRouter(fetchJson).route(PICKUP, DROP);

    expect(route).toEqual({ km: 7.26, mins: 14 });
  });

  it('returns null when OSRM has no route', async () => {
    const { fetchJson } = recordingFetchJson({ code: 'NoRoute' });

    const route = await createOsrmRouter(fetchJson).route(PICKUP, DROP);

    expect(route).toBeNull();
  });

  it('returns null instead of failing when OSRM is unreachable', async () => {
    const { fetchJson } = recordingFetchJson(new Error('timeout'));

    const route = await createOsrmRouter(fetchJson).route(PICKUP, DROP);

    expect(route).toBeNull();
  });
});
