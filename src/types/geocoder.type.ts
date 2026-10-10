import type { GeocodeHit } from './geocode-hit.type.js';

export interface Geocoder {
  search(text: string): Promise<GeocodeHit | null>;
}
