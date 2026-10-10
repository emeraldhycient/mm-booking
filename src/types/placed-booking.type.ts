import type { BookedReply } from './booked-reply.type.js';
import type { QuotedTrip } from './quoted-trip.type.js';

export interface PlacedBooking {
  trip: QuotedTrip;
  reply: BookedReply;
}
