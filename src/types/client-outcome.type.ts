import type { ApiError } from '../errors/api-error.js';
import type { ApiClient } from './api-client.type.js';

export interface ClientOutcome {
  client?: ApiClient;
  error?: ApiError;
}
