import type { NextFunction, Request, Response } from 'express';
import { ERROR_CODE } from '../constants/error.constant.js';
import { BODY_PARSER_ERROR_TYPES, HTTP_STATUS } from '../constants/http.constant.js';
import { LOG_EVENT, LOG_LEVEL } from '../constants/log.constant.js';
import type { ErrorBody } from '../types/error-body.type.js';
import { ApiError } from './api-error.js';

export function handleError(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const apiError = toApiError(error);
  if (apiError.status >= HTTP_STATUS.INTERNAL) logServerError(apiError);
  res.status(apiError.status).json(toErrorBody(apiError));
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isBodyParserError(error)) return new ApiError(ERROR_CODE.INVALID_JSON, { cause: error });
  return new ApiError(ERROR_CODE.INTERNAL, { cause: error });
}

function isBodyParserError(error: unknown): boolean {
  const type = (error as { type?: unknown } | null)?.type;
  return typeof type === 'string' && BODY_PARSER_ERROR_TYPES.includes(type);
}

function toErrorBody(error: ApiError): ErrorBody {
  const fields = error.fields.length ? { fields: error.fields } : {};
  return { ok: false, error: { code: error.code, message: error.message, ...fields } };
}

function logServerError(error: ApiError): void {
  const entry = { level: LOG_LEVEL.ERROR, event: LOG_EVENT.SERVER_ERROR, code: error.code, cause: String(error.cause ?? '') };
  console.error(JSON.stringify(entry));
}
