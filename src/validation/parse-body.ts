import type { z } from 'zod';
import { ERROR_CODE } from '../constants/error.constant.js';
import { FIELD_PATH_SEPARATOR, ROOT_FIELD } from '../constants/validation.constant.js';
import { ApiError } from '../errors/api-error.js';
import type { FieldIssue } from '../types/field-issue.type.js';
import type { ZodIssue } from '../types/zod-issue.type.js';

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  throw new ApiError(ERROR_CODE.VALIDATION_FAILED, { fields: result.error.issues.map(toFieldIssue) });
}

function toFieldIssue(issue: ZodIssue): FieldIssue {
  return { field: issue.path.map(String).join(FIELD_PATH_SEPARATOR) || ROOT_FIELD, message: issue.message };
}
