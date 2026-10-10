import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ERROR_CODE } from '../constants/error.constant.js';
import { RATE_LIMIT } from '../constants/limits.constant.js';
import { ApiError } from '../errors/api-error.js';

export function createIpLimiter(): RequestHandler {
  return rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    limit: RATE_LIMIT.PER_IP,
    standardHeaders: RATE_LIMIT.HEADERS,
    legacyHeaders: false,
    handler: rejectRateLimited,
  });
}

export function createKeyLimiter(): RequestHandler {
  return rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    limit: RATE_LIMIT.PER_KEY,
    standardHeaders: RATE_LIMIT.HEADERS,
    legacyHeaders: false,
    keyGenerator: clientKey,
    handler: rejectRateLimited,
  });
}

function clientKey(_req: Request, res: Response): string {
  return res.locals.client.id;
}

function rejectRateLimited(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(ERROR_CODE.RATE_LIMITED));
}
