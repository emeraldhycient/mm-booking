import type { ScriptClient } from '../../types/script-client.type.js';
import type { ScriptOrderBody } from '../../types/script-order-body.type.js';
import type { TripLeg } from '../../types/trip-leg.type.js';

export interface ScriptCalls {
  lookupClient: string[];
  quote: TripLeg[];
  resolve: string[];
  placeOrder: ScriptOrderBody[];
}

export type ScriptFailures = Partial<Record<keyof ScriptClient, Error>>;
