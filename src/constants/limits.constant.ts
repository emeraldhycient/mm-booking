import type { ErrorCode } from '../types/error-code.type.js';
import { ERROR_CODE } from './error.constant.js';

export const RATE_LIMIT = { WINDOW_MS: 60_000, PER_KEY: 30, PER_IP: 60, HEADERS: 'draft-8' } as const;
export const CLIENT_CACHE_TTL_MS = 60_000;
export const CACHEABLE_LOOKUP_ERRORS: readonly ErrorCode[] = [ERROR_CODE.UNAUTHORIZED, ERROR_CODE.CLIENT_DISABLED];
