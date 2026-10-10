import { LOG_EVENT, LOG_LEVEL } from '../constants/log.constant.js';
import type { ApiClient } from '../types/api-client.type.js';
import type { PlacedBooking } from '../types/placed-booking.type.js';

export function logBooking(booking: PlacedBooking, client: ApiClient): void {
  const entry = {
    level: LOG_LEVEL.INFO,
    event: LOG_EVENT.BOOKING,
    client: client.id,
    orderId: booking.reply.orderId,
    duplicate: booking.reply.duplicate === true,
  };
  console.info(JSON.stringify(entry));
}
