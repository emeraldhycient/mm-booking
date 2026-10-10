import type { RequestHandler } from 'express';
import { ERROR_CODE } from '../constants/error.constant.js';
import { ApiError } from '../errors/api-error.js';

export const requireJsonObject: RequestHandler = function requireJsonObject(req, _res, next) {
  if (!isPlainObject(req.body)) throw new ApiError(ERROR_CODE.INVALID_JSON);
  next();
};

function isPlainObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
