import type { ErrorCode } from './error-code.type.js';
import type { FieldIssue } from './field-issue.type.js';

export interface ErrorBodyDetail {
  code: ErrorCode;
  message: string;
  fields?: FieldIssue[];
}
