import type { AppDeps } from './app-deps.type.js';

export type TripDeps = Pick<AppDeps, 'scriptClient' | 'geocoder' | 'router'>;
