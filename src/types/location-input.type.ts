import type { LOCATION_PREFIX } from '../constants/pin.constant.js';

export interface LocationInput {
  prefix: (typeof LOCATION_PREFIX)[keyof typeof LOCATION_PREFIX];
  address: string;
  pin?: string;
  fallback?: string;
}
