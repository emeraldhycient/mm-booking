import { KIGALI_BOX, KIGALI_CENTER } from '../constants/kigali.constant.js';
import { PHOTON_LABEL_SEPARATOR, PHOTON_PARAM, PHOTON_RESULT_LIMIT, PHOTON_URL, UPSTREAM_CALL } from '../constants/upstream.constant.js';
import type { FetchJson } from '../types/fetch-json.type.js';
import type { GeocodeHit } from '../types/geocode-hit.type.js';
import type { Geocoder } from '../types/geocoder.type.js';
import type { PhotonProperties } from '../types/photon-properties.type.js';
import type { PhotonReply } from '../types/photon-reply.type.js';

export function createPhotonGeocoder(fetchJson: FetchJson): Geocoder {
  return {
    search(text: string): Promise<GeocodeHit | null> {
      return searchPhoton(text, fetchJson);
    },
  };
}

async function searchPhoton(text: string, fetchJson: FetchJson): Promise<GeocodeHit | null> {
  const reply = (await fetchJson(photonUrl(text), UPSTREAM_CALL.GEOCODE)) as PhotonReply;
  const feature = reply.features?.[0];
  if (!feature) return null;
  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng, label: photonLabel(feature.properties ?? {}) };
}

function photonUrl(text: string): string {
  const bbox = [KIGALI_BOX.minLng, KIGALI_BOX.minLat, KIGALI_BOX.maxLng, KIGALI_BOX.maxLat].join(',');
  const query = new URLSearchParams({
    [PHOTON_PARAM.QUERY]: text,
    [PHOTON_PARAM.LIMIT]: String(PHOTON_RESULT_LIMIT),
    [PHOTON_PARAM.LAT]: String(KIGALI_CENTER.lat),
    [PHOTON_PARAM.LON]: String(KIGALI_CENTER.lng),
    [PHOTON_PARAM.BBOX]: bbox,
  });
  return `${PHOTON_URL}?${query}`;
}

function photonLabel(properties: PhotonProperties): string {
  const parts = [properties.name ?? properties.street, properties.district ?? properties.locality, properties.city];
  return parts.filter(Boolean).join(PHOTON_LABEL_SEPARATOR);
}
