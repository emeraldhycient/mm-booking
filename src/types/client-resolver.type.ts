import type { ApiClient } from './api-client.type.js';

export interface ClientResolver {
  resolve(apiKey: string): Promise<ApiClient>;
}
