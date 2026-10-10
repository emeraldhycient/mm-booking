import type { FieldIssue } from './field-issue.type.js';

export interface ApiErrorDetail {
  message?: string;
  fields?: FieldIssue[];
  cause?: unknown;
}
