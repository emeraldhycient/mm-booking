import type { GeocodeHit } from '../../types/geocode-hit.type.js';

export const RESTAURANT_ADDRESS = 'KG 550 Street, Kicukiro';
export const RECEIVER_ADDRESS = 'KG 108 Street, Remera';

export const GEOCODE_HITS: Record<string, GeocodeHit> = {
  [RESTAURANT_ADDRESS]: { lat: -1.93422, lng: 30.084892, label: 'KG 550 Street, Kicukiro' },
  [RECEIVER_ADDRESS]: { lat: -1.929434, lng: 30.134337, label: 'KG 108 Street, Remera' },
};
