import type { TripPins } from '../types/trip-pins.type.js';

export function toPins(trip: TripPins): TripPins {
  return { pickup: trip.pickup, dropoff: trip.dropoff };
}
