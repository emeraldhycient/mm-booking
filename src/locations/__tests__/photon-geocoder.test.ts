import { describe, expect, it } from 'vitest';
import { recordingFetchJson } from '../../__tests__/fixtures/recording-fetch-json.js';
import { ApiError } from '../../errors/api-error.js';
import { createPhotonGeocoder } from '../photon-geocoder.js';

const FEATURE = {
  geometry: { coordinates: [30.084892, -1.93422] },
  properties: { name: 'KG 550 Street', district: 'Kicukiro', city: 'Kigali' },
};

describe('the Photon geocoder', () => {
  it('searches Photon for one match inside the Kigali box', async () => {
    const { calls, fetchJson } = recordingFetchJson({ features: [] });

    await createPhotonGeocoder(fetchJson).search('KG 550 Street');

    const url = new URL(calls[0]![0]);
    expect(url.origin + url.pathname).toBe('https://photon.komoot.io/api/');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: 'KG 550 Street', limit: '1', lat: '-1.9499', lon: '30.0913', bbox: '29.95,-2.1,30.3,-1.8',
    });
  });

  it('returns the first match with a readable label', async () => {
    const { fetchJson } = recordingFetchJson({ features: [FEATURE] });

    const hit = await createPhotonGeocoder(fetchJson).search('KG 550 Street');

    expect(hit).toEqual({ lat: -1.93422, lng: 30.084892, label: 'KG 550 Street, Kicukiro, Kigali' });
  });

  it('returns null when Photon finds nothing', async () => {
    const { fetchJson } = recordingFetchJson({ features: [] });

    const hit = await createPhotonGeocoder(fetchJson).search('nowhere at all');

    expect(hit).toBeNull();
  });

  it('lets an unreachable Photon fail the request', async () => {
    const { fetchJson } = recordingFetchJson(new ApiError('UPSTREAM_UNAVAILABLE'));

    const attempt = createPhotonGeocoder(fetchJson).search('KG 550 Street');

    await expect(attempt).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
  });
});
