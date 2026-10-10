import { ERROR_CODE } from '../constants/error.constant.js';
import { HEADER, HTTP_METHOD } from '../constants/http.constant.js';
import { TEXT_PLAIN_JSON, UPSTREAM_HTTP_ERROR, USER_AGENT } from '../constants/upstream.constant.js';
import { ApiError } from '../errors/api-error.js';
import type { FetchCall } from '../types/fetch-call.type.js';
import type { FetchJson } from '../types/fetch-json.type.js';
import type { FetchJsonOptions } from '../types/fetch-json-options.type.js';

export function createFetchJson(fetchImpl: typeof fetch = fetch): FetchJson {
  return function fetchJson(url, options) {
    return fetchWithRetry({ url, options, fetchImpl }, options.tries);
  };
}

async function fetchWithRetry(call: FetchCall, triesLeft: number): Promise<unknown> {
  try {
    return await fetchOnce(call);
  } catch (error) {
    if (triesLeft > 1) return fetchWithRetry(call, triesLeft - 1);
    throw new ApiError(ERROR_CODE.UPSTREAM_UNAVAILABLE, { cause: error });
  }
}

async function fetchOnce({ url, options, fetchImpl }: FetchCall): Promise<unknown> {
  const response = await fetchImpl(url, {
    method: options.method ?? HTTP_METHOD.GET,
    headers: requestHeaders(options),
    body: options.body,
    signal: AbortSignal.timeout(options.timeoutMs),
  });
  if (!response.ok) throw new Error(`${UPSTREAM_HTTP_ERROR} ${response.status} ${new URL(url).host}`);
  return response.json();
}

function requestHeaders(options: FetchJsonOptions): Record<string, string> {
  const headers: Record<string, string> = { [HEADER.USER_AGENT]: USER_AGENT };
  if (options.body !== undefined) headers[HEADER.CONTENT_TYPE] = TEXT_PLAIN_JSON;
  return headers;
}
