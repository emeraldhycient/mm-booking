import { ERROR_MESSAGE, ERROR_STATUS } from '../constants/error.constant.js';
import type { ApiErrorDetail } from '../types/api-error-detail.type.js';
import type { ErrorCode } from '../types/error-code.type.js';
import type { FieldIssue } from '../types/field-issue.type.js';

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields: FieldIssue[];

  constructor(code: ErrorCode, detail: ApiErrorDetail = {}) {
    super(detail.message ?? ERROR_MESSAGE[code], { cause: detail.cause });
    this.name = 'ApiError';
    this.code = code;
    this.status = ERROR_STATUS[code];
    this.fields = detail.fields ?? [];
  }
}
