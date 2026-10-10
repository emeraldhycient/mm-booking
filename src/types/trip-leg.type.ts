import type { LatLng } from './lat-lng.type.js';
import type { RoadRoute } from './road-route.type.js';

export interface TripLeg {
  from: LatLng;
  to: LatLng;
  route: RoadRoute | null;
}
