import type { LatLng } from './lat-lng.type.js';
import type { RoadRoute } from './road-route.type.js';

export interface RoadRouter {
  route(from: LatLng, to: LatLng): Promise<RoadRoute | null>;
}
