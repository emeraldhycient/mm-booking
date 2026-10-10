import type { RequestHandler } from 'express';
import { ERROR_CODE } from '../constants/error.constant.js';
import { API_KEY_HEADER } from '../constants/http.constant.js';
import { ApiError } from '../errors/api-error.js';
import type { ClientResolver } from '../types/client-resolver.type.js';

export function createRequireClient(resolver: ClientResolver): RequestHandler {
  return async function requireClient(req, res, next) {
    const apiKey = req.get(API_KEY_HEADER)?.trim() ?? '';
    if (!apiKey) throw new ApiError(ERROR_CODE.UNAUTHORIZED);
    res.locals.client = await resolver.resolve(apiKey);
    res.locals.apiKey = apiKey;
    next();
  };
}
