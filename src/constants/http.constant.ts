export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
  BAD_GATEWAY: 502,
  UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const HTTP_METHOD = { GET: 'GET', POST: 'POST' } as const;
export const HEADER = { USER_AGENT: 'User-Agent', CONTENT_TYPE: 'Content-Type' } as const;
export const ROUTE = { INDEX: '/', API: '/api', QUOTE: '/quote', REQUEST: '/request' } as const;
export const API_KEY_HEADER = 'x-api-key';
export const JSON_BODY_LIMIT = '10kb';
export const TRUST_PROXY_HOPS = 1;
export const BODY_PARSER_ERROR_TYPES: readonly string[] = [
  'entity.parse.failed',
  'entity.too.large',
  'encoding.unsupported',
  'charset.unsupported',
];
