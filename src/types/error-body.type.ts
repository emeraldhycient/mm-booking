import type { ErrorBodyDetail } from './error-body-detail.type.js';

export interface ErrorBody {
  ok: false;
  error: ErrorBodyDetail;
}
