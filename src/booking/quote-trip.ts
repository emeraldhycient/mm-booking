import { ERROR_CODE } from '../constants/error.constant.js';
import { LOCATION_PREFIX } from '../constants/pin.constant.js';
import { ApiError } from '../errors/api-error.js';
import { placeLocation } from '../locations/place-location.js';
import { toScriptApiError } from '../script/script-error.js';
import type { LocationInput } from '../types/location-input.type.js';
import type { QuoteRequest } from '../types/quote-request.type.js';
import type { QuotedTrip } from '../types/quoted-trip.type.js';
import type { ScriptQuoteReply } from '../types/script-quote-reply.type.js';
import type { TripDeps } from '../types/trip-deps.type.js';

export async function quoteTrip(request: QuoteRequest, deps: TripDeps): Promise<QuotedTrip> {
  const [pickup, dropoff] = await Promise.all([
    placeLocation(restaurantLocation(request), deps),
    placeLocation(receiverLocation(request), deps),
  ]);
  const route = await deps.router.route(pickup, dropoff);
  const quote = await deps.scriptClient.quote(pickup, dropoff, route);
  assertQuoted(quote);
  return { pickup, dropoff, route, quote };
}

function restaurantLocation(request: QuoteRequest): LocationInput {
  return {
    prefix: LOCATION_PREFIX.RESTAURANT,
    address: request.restaurant_address,
    pin: request.restaurant_pin,
    fallback: request.restaurant_name,
  };
}

function receiverLocation(request: QuoteRequest): LocationInput {
  return { prefix: LOCATION_PREFIX.RECEIVER, address: request.receiver_address, pin: request.receiver_pin };
}

function assertQuoted(quote: ScriptQuoteReply): void {
  if (!quote.ok) throw toScriptApiError(quote.error);
  if (!quote.inArea) throw new ApiError(ERROR_CODE.OUTSIDE_SERVICE_AREA);
}
