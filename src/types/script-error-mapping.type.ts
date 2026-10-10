import type { ErrorCode } from './error-code.type.js';

export interface ScriptErrorMapping {
  code: ErrorCode;
  message?: string;
}
