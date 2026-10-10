import type { RequestHandler } from 'express';
import { ERROR_CODE } from '../constants/error.constant.js';
import { ApiError } from '../errors/api-error.js';

export const rejectUnknownApiRoute: RequestHandler = function rejectUnknownApiRoute() {
  throw new ApiError(ERROR_CODE.NOT_FOUND);
};
