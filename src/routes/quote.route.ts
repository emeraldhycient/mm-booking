import type { RequestHandler } from 'express';
import { assertCompany } from '../auth/assert-company.js';
import { quoteTrip } from '../booking/quote-trip.js';
import { toPins } from '../booking/to-pins.js';
import { toPrice } from '../booking/to-price.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import type { QuoteResponse } from '../types/quote-response.type.js';
import type { TripDeps } from '../types/trip-deps.type.js';
import { parseBody } from '../validation/parse-body.js';
import { quoteRequestSchema } from '../validation/booking-request.schema.js';

export function createQuoteHandler(deps: TripDeps): RequestHandler {
  return async function handleQuote(req, res) {
    assertCompany(req.body, res.locals.client);
    const request = parseBody(quoteRequestSchema, req.body);
    const trip = await quoteTrip(request, deps);
    const body: QuoteResponse = { ok: true, price: toPrice(trip.quote), pins: toPins(trip) };
    res.status(HTTP_STATUS.OK).json(body);
  };
}
