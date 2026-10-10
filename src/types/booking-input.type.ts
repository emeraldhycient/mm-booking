import type { ApiClient } from './api-client.type.js';
import type { BookingRequest } from './booking-request.type.js';

export interface BookingInput {
  request: BookingRequest;
  client: ApiClient;
  apiKey: string;
}
