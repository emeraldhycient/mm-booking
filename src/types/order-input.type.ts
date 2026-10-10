import type { BookingInput } from './booking-input.type.js';
import type { QuotedTrip } from './quoted-trip.type.js';

export interface OrderInput extends BookingInput {
  trip: QuotedTrip;
}
