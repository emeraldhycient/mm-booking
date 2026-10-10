import { DETAIL_MESSAGE, ERROR_CODE } from '../constants/error.constant.js';
import { SCRIPT_ERROR_MAP } from '../constants/script.constant.js';
import { ApiError } from '../errors/api-error.js';

export function toScriptApiError(scriptError: string | undefined): ApiError {
  const known = scriptError && Object.hasOwn(SCRIPT_ERROR_MAP, scriptError) ? SCRIPT_ERROR_MAP[scriptError] : undefined;
  if (known) return new ApiError(known.code, { message: known.message });
  return new ApiError(ERROR_CODE.UPSTREAM_REJECTED, { message: scriptError ?? DETAIL_MESSAGE.UNKNOWN_SCRIPT_ERROR });
}
