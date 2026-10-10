import type { FetchJsonOptions } from './fetch-json-options.type.js';

export interface FetchCall {
  url: string;
  options: FetchJsonOptions;
  fetchImpl: typeof fetch;
}
