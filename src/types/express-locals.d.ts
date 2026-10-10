import type { ApiClient } from './api-client.type.js';

declare global {
  namespace Express {
    interface Locals {
      client: ApiClient;
      apiKey: string;
    }
  }
}

export {};
