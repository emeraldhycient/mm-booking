import type { GeocodeHit } from '../../types/geocode-hit.type.js';
import type { Geocoder } from '../../types/geocoder.type.js';
import { GEOCODE_HITS } from './geocode-hits.js';

export class FakeGeocoder implements Geocoder {
  readonly calls: string[] = [];

  constructor(private readonly hits: Record<string, GeocodeHit> = GEOCODE_HITS) {}

  async search(text: string): Promise<GeocodeHit | null> {
    this.calls.push(text);
    return this.hits[text] ?? null;
  }
}
