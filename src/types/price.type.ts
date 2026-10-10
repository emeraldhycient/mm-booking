import type { CURRENCY } from '../constants/booking.constant.js';
import type { PriceLine } from './price-line.type.js';

export interface Price {
  amount_rwf: number;
  currency: typeof CURRENCY;
  distance_km: number;
  est_minutes: number;
  breakdown: PriceLine[];
}
