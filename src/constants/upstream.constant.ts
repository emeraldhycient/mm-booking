export const PHOTON_URL = 'https://photon.komoot.io/api/';
export const PHOTON_PARAM = { QUERY: 'q', LIMIT: 'limit', LAT: 'lat', LON: 'lon', BBOX: 'bbox' } as const;
export const PHOTON_RESULT_LIMIT = 1;
export const PHOTON_LABEL_SEPARATOR = ', ';
export const OSRM_ROUTE_URL = 'https://routing.openstreetmap.de/routed-car/route/v1/driving/';
export const OSRM_QUERY = '?overview=false&steps=false';
export const OSRM_OK = 'Ok';
export const METERS_PER_KM = 1000;
export const SECONDS_PER_MINUTE = 60;
export const USER_AGENT = 'MovingMan-BookingAPI/1.0 (+https://book.movingman.online)';
export const TEXT_PLAIN_JSON = 'text/plain;charset=utf-8';
export const UPSTREAM_HTTP_ERROR = 'Upstream HTTP';
export const UPSTREAM_CALL = {
  CLIENT_LOOKUP: { timeoutMs: 10_000, tries: 2 },
  QUOTE: { timeoutMs: 10_000, tries: 3 },
  RESOLVE: { timeoutMs: 10_000, tries: 2 },
  ORDER: { timeoutMs: 25_000, tries: 2 },
  GEOCODE: { timeoutMs: 8_000, tries: 2 },
  ROUTE: { timeoutMs: 8_000, tries: 1 },
} as const;
