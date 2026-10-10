import type { Price } from './price.type.js';
import type { RecordedRow } from './recorded-row.type.js';
import type { TripPins } from './trip-pins.type.js';

export interface BookingResponse {
  ok: true;
  duplicate: boolean;
  booking_reference: string;
  external_reference: string;
  price: Price;
  pins: TripPins;
  recorded: RecordedRow;
}
