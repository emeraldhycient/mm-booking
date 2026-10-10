import type { ClientOutcome } from './client-outcome.type.js';

export interface CachedClient {
  outcome: ClientOutcome;
  expiresAt: number;
}
