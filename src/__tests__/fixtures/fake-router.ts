import type { LatLng } from '../../types/lat-lng.type.js';
import type { RoadRoute } from '../../types/road-route.type.js';
import type { RoadRouter } from '../../types/road-router.type.js';
import { ROAD_7_26_KM } from './script-replies.js';

export class FakeRouter implements RoadRouter {
  readonly calls: LatLng[][] = [];

  constructor(public result: RoadRoute | null = ROAD_7_26_KM) {}

  async route(from: LatLng, to: LatLng): Promise<RoadRoute | null> {
    this.calls.push([from, to]);
    return this.result;
  }
}
