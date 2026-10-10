import type { Price } from './price.type.js';
import type { TripPins } from './trip-pins.type.js';

export interface QuoteResponse {
  ok: true;
  price: Price;
  pins: TripPins;
}
