import type { BookingRequest } from '../types/booking-request.type.js';
import type { BookingResponse } from '../types/booking-response.type.js';
import type { PlacedBooking } from '../types/placed-booking.type.js';
import { recordedPins } from './recorded-pins.js';
import { toPins } from './to-pins.js';
import { toPrice } from './to-price.js';

export function toBookingResponse(booking: PlacedBooking, request: BookingRequest): BookingResponse {
  return {
    ok: true,
    duplicate: booking.reply.duplicate === true,
    booking_reference: booking.reply.orderId,
    external_reference: request.external_reference,
    price: toPrice(booking.reply),
    pins: (booking.reply.duplicate && recordedPins(booking.reply.row)) || toPins(booking.trip),
    recorded: booking.reply.row,
  };
}
