import type { ErrorCode } from '../types/error-code.type.js';
import { HTTP_STATUS } from './http.constant.js';

export const ERROR_CODE = {
  INVALID_JSON: 'INVALID_JSON',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CLIENT_DISABLED: 'CLIENT_DISABLED',
  COMPANY_MISMATCH: 'COMPANY_MISMATCH',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  OUTSIDE_SERVICE_AREA: 'OUTSIDE_SERVICE_AREA',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
  UPSTREAM_REJECTED: 'UPSTREAM_REJECTED',
  NOT_ACCEPTING_ORDERS: 'NOT_ACCEPTING_ORDERS',
  UPSTREAM_UNAVAILABLE: 'UPSTREAM_UNAVAILABLE',
} as const;

export const ERROR_STATUS: Record<ErrorCode, number> = {
  INVALID_JSON: HTTP_STATUS.BAD_REQUEST,
  UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
  CLIENT_DISABLED: HTTP_STATUS.FORBIDDEN,
  COMPANY_MISMATCH: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  VALIDATION_FAILED: HTTP_STATUS.UNPROCESSABLE,
  ADDRESS_NOT_FOUND: HTTP_STATUS.UNPROCESSABLE,
  OUTSIDE_SERVICE_AREA: HTTP_STATUS.UNPROCESSABLE,
  RATE_LIMITED: HTTP_STATUS.TOO_MANY_REQUESTS,
  INTERNAL: HTTP_STATUS.INTERNAL,
  UPSTREAM_REJECTED: HTTP_STATUS.BAD_GATEWAY,
  NOT_ACCEPTING_ORDERS: HTTP_STATUS.UNAVAILABLE,
  UPSTREAM_UNAVAILABLE: HTTP_STATUS.GATEWAY_TIMEOUT,
};

export const ERROR_MESSAGE: Record<ErrorCode, string> = {
  INVALID_JSON: 'Send a JSON object of at most 10 kB with Content-Type: application/json.',
  UNAUTHORIZED: 'Missing or unknown API key.',
  CLIENT_DISABLED: 'This API key is disabled. Contact Moving Man.',
  COMPANY_MISMATCH: 'booking_company does not match this API key.',
  NOT_FOUND: 'No such endpoint.',
  VALIDATION_FAILED: 'Some fields are missing or invalid.',
  ADDRESS_NOT_FOUND: 'We could not place this location. Send a pin.',
  OUTSIDE_SERVICE_AREA: 'Pickup or drop-off is outside our Kigali service area.',
  RATE_LIMITED: 'Too many requests. Wait a minute and retry.',
  INTERNAL: 'Something went wrong on our side.',
  UPSTREAM_REJECTED: 'The booking service refused the request.',
  NOT_ACCEPTING_ORDERS: 'Moving Man is not taking new bookings right now.',
  UPSTREAM_UNAVAILABLE: 'A booking service did not answer in time. Retry with the same external_reference.',
};

export const DETAIL_MESSAGE = {
  CLIENT_MISCONFIGURED: 'This client is not fully set up. Contact Moving Man.',
  UNKNOWN_SCRIPT_ERROR: 'The booking service refused the request without a reason.',
  NO_PRICE: 'The booking service returned no price.',
  NO_ORDER_ID: 'The booking service did not return an order id.',
} as const;
