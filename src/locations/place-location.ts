import { ERROR_CODE, ERROR_MESSAGE } from '../constants/error.constant.js';
import { ADDRESS_FIELD_SUFFIX, PIN_FIELD_SUFFIX, PIN_KIND } from '../constants/pin.constant.js';
import { ApiError } from '../errors/api-error.js';
import type { LatLng } from '../types/lat-lng.type.js';
import type { LocationInput } from '../types/location-input.type.js';
import type { PlacedPin } from '../types/placed-pin.type.js';
import type { TripDeps } from '../types/trip-deps.type.js';
import { parsePin } from './parse-pin.js';
import { recoverPlusCode } from './plus-code.js';
import { roundCoordinate } from './round-coordinate.js';

export async function placeLocation(input: LocationInput, deps: TripDeps): Promise<PlacedPin> {
  const placed = input.pin ? await fromPin(input.pin, deps) : await fromAddress(input, deps);
  if (!placed) throw notFound(input);
  return { ...placed, lat: roundCoordinate(placed.lat), lng: roundCoordinate(placed.lng) };
}

async function fromPin(pin: string, deps: TripDeps): Promise<PlacedPin | null> {
  const parsed = parsePin(pin);
  if (!parsed) return null;
  if (parsed.kind === PIN_KIND.COORDS) return provided(parsed.point);
  if (parsed.kind === PIN_KIND.PLUS) return provided(recoverPlusCode(parsed.code));
  const reply = await deps.scriptClient.resolve(parsed.url);
  const point = reply.ok && typeof reply.lat === 'number' && typeof reply.lng === 'number' ? { lat: reply.lat, lng: reply.lng } : null;
  return provided(point);
}

async function fromAddress(input: LocationInput, deps: TripDeps): Promise<PlacedPin | null> {
  const byAddress = await deps.geocoder.search(input.address);
  const hit = byAddress ?? (input.fallback ? await deps.geocoder.search(input.fallback) : null);
  return hit ? { lat: hit.lat, lng: hit.lng, source: 'geocoded', matched: hit.label } : null;
}

function provided(point: LatLng | null): PlacedPin | null {
  return point ? { lat: point.lat, lng: point.lng, source: 'provided', matched: null } : null;
}

function notFound(input: LocationInput): ApiError {
  const field = input.prefix + (input.pin ? PIN_FIELD_SUFFIX : ADDRESS_FIELD_SUFFIX);
  return new ApiError(ERROR_CODE.ADDRESS_NOT_FOUND, { fields: [{ field, message: ERROR_MESSAGE.ADDRESS_NOT_FOUND }] });
}
