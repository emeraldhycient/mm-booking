import type { ERROR_CODE } from '../constants/error.constant.js';

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
