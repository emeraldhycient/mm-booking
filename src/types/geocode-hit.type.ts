import type { LatLng } from './lat-lng.type.js';

export interface GeocodeHit extends LatLng {
  label: string;
}
