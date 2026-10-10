import type { ClientOutcome } from './client-outcome.type.js';

export interface CacheEntry {
  apiKey: string;
  outcome: ClientOutcome;
  nowMs: number;
}
