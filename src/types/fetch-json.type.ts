import type { FetchJsonOptions } from './fetch-json-options.type.js';

export type FetchJson = (url: string, options: FetchJsonOptions) => Promise<unknown>;
