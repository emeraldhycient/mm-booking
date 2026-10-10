import { METERS_PER_KM, OSRM_OK, OSRM_QUERY, OSRM_ROUTE_URL, SECONDS_PER_MINUTE, UPSTREAM_CALL } from '../constants/upstream.constant.js';
import type { FetchJson } from '../types/fetch-json.type.js';
import type { LatLng } from '../types/lat-lng.type.js';
import type { OsrmReply } from '../types/osrm-reply.type.js';
import type { RoadRoute } from '../types/road-route.type.js';
import type { RoadRouter } from '../types/road-router.type.js';

export function createOsrmRouter(fetchJson: FetchJson): RoadRouter {
  return {
    route(from: LatLng, to: LatLng): Promise<RoadRoute | null> {
      return fetchRoute(osrmUrl(from, to), fetchJson);
    },
  };
}

async function fetchRoute(url: string, fetchJson: FetchJson): Promise<RoadRoute | null> {
  try {
    const reply = (await fetchJson(url, UPSTREAM_CALL.ROUTE)) as OsrmReply;
    const best = reply.code === OSRM_OK ? reply.routes?.[0] : undefined;
    return best ? { km: best.distance / METERS_PER_KM, mins: Math.ceil(best.duration / SECONDS_PER_MINUTE) } : null;
  } catch {
    return null;
  }
}

function osrmUrl(from: LatLng, to: LatLng): string {
  return `${OSRM_ROUTE_URL}${from.lng},${from.lat};${to.lng},${to.lat}${OSRM_QUERY}`;
}
