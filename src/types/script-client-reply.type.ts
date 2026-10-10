import type { ApiClient } from './api-client.type.js';

export interface ScriptClientReply {
  ok: boolean;
  error?: string;
  client?: ApiClient;
}
