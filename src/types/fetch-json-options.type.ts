import type { HttpMethod } from './http-method.type.js';
import type { UpstreamCall } from './upstream-call.type.js';

export interface FetchJsonOptions extends UpstreamCall {
  method?: HttpMethod;
  body?: string;
}
