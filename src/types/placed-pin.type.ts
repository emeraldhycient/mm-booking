import type { LatLng } from './lat-lng.type.js';
import type { PinSource } from './pin-source.type.js';

export interface PlacedPin extends LatLng {
  source: PinSource;
  matched: string | null;
}
