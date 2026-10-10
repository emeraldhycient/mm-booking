import { ERROR_CODE } from '../constants/error.constant.js';
import { FIELD } from '../constants/validation.constant.js';
import { ApiError } from '../errors/api-error.js';
import type { ApiClient } from '../types/api-client.type.js';

export function assertCompany(body: Record<string, unknown>, client: ApiClient): void {
  const company = body[FIELD.BOOKING_COMPANY];
  if (typeof company !== 'string' || !company.trim()) return;
  if (normalise(company) !== normalise(client.name)) throw new ApiError(ERROR_CODE.COMPANY_MISMATCH);
}

function normalise(name: string): string {
  return name.trim().toLowerCase();
}
