import { DETAIL_MESSAGE, ERROR_CODE } from '../constants/error.constant.js';
import { ApiError } from '../errors/api-error.js';
import { toScriptApiError } from '../script/script-error.js';
import type { BookingInput } from '../types/booking-input.type.js';
import type { PlacedBooking } from '../types/placed-booking.type.js';
import type { ScriptOrderReply } from '../types/script-order-reply.type.js';
import type { TripDeps } from '../types/trip-deps.type.js';
import { buildOrderBody } from './build-order-body.js';
import { quoteTrip } from './quote-trip.js';

export async function placeBooking(input: BookingInput, deps: TripDeps): Promise<PlacedBooking> {
  const trip = await quoteTrip(input.request, deps);
  const reply = await deps.scriptClient.placeOrder(buildOrderBody({ ...input, trip }));
  if (!reply.ok || !reply.orderId || !reply.row) throw toOrderError(reply);
  return { trip, reply: { ...reply, orderId: reply.orderId, row: reply.row } };
}

function toOrderError(reply: ScriptOrderReply): ApiError {
  if (!reply.ok) return toScriptApiError(reply.error);
  return new ApiError(ERROR_CODE.UPSTREAM_REJECTED, { message: DETAIL_MESSAGE.NO_ORDER_ID });
}
