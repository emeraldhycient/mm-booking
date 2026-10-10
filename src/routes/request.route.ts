import type { RequestHandler } from 'express';
import { assertCompany } from '../auth/assert-company.js';
import { logBooking } from '../booking/log-booking.js';
import { placeBooking } from '../booking/place-booking.js';
import { toBookingResponse } from '../booking/to-booking-response.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import type { AppDeps } from '../types/app-deps.type.js';
import { createBookingRequestSchema } from '../validation/booking-request.schema.js';
import { parseBody } from '../validation/parse-body.js';

export function createRequestHandler(deps: AppDeps): RequestHandler {
  return async function handleRequest(req, res) {
    const { client, apiKey } = res.locals;
    assertCompany(req.body, client);
    const request = parseBody(createBookingRequestSchema(deps.now()), req.body);
    const booking = await placeBooking({ request, client, apiKey }, deps);
    logBooking(booking, client);
    const status = booking.reply.duplicate ? HTTP_STATUS.OK : HTTP_STATUS.CREATED;
    res.status(status).json(toBookingResponse(booking, request));
  };
}
