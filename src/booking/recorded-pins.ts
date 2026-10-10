import { RECORDED_COLUMN } from '../constants/booking.constant.js';
import { PIN_KIND, PIN_SOURCE } from '../constants/pin.constant.js';
import { parsePin } from '../locations/parse-pin.js';
import type { PlacedPin } from '../types/placed-pin.type.js';
import type { RecordedRow } from '../types/recorded-row.type.js';
import type { TripPins } from '../types/trip-pins.type.js';

export function recordedPins(row: RecordedRow): TripPins | null {
  const pickup = recordedPin(row[RECORDED_COLUMN.PICKUP_LAT_LNG]);
  const dropoff = recordedPin(row[RECORDED_COLUMN.DROP_LAT_LNG]);
  return pickup && dropoff ? { pickup, dropoff } : null;
}

function recordedPin(value: string | undefined): PlacedPin | null {
  const parsed = value ? parsePin(value) : null;
  if (parsed?.kind !== PIN_KIND.COORDS) return null;
  return { lat: parsed.point.lat, lng: parsed.point.lng, source: PIN_SOURCE.RECORDED, matched: null };
}
