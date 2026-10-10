import type { RoadRoute } from './road-route.type.js';
import type { ScriptQuoteReply } from './script-quote-reply.type.js';
import type { TripPins } from './trip-pins.type.js';

export interface QuotedTrip extends TripPins {
  route: RoadRoute | null;
  quote: ScriptQuoteReply;
}
