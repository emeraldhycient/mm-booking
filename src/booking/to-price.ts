import { BASE_FARE_LABEL, CURRENCY } from '../constants/booking.constant.js';
import { DETAIL_MESSAGE, ERROR_CODE } from '../constants/error.constant.js';
import { ApiError } from '../errors/api-error.js';
import type { FareLine } from '../types/fare-line.type.js';
import type { Price } from '../types/price.type.js';
import type { PriceLine } from '../types/price-line.type.js';
import type { PricedReply } from '../types/priced-reply.type.js';

export function toPrice(reply: PricedReply): Price {
  if (!isWholePositive(reply.fee) || typeof reply.km !== 'number' || typeof reply.mins !== 'number') {
    throw new ApiError(ERROR_CODE.UPSTREAM_REJECTED, { message: DETAIL_MESSAGE.NO_PRICE });
  }
  return {
    amount_rwf: reply.fee,
    currency: CURRENCY,
    distance_km: reply.km,
    est_minutes: reply.mins,
    breakdown: toBreakdown(reply),
  };
}

function isWholePositive(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function toBreakdown(reply: PricedReply): PriceLine[] {
  if (typeof reply.base !== 'number' || !reply.lines) return [];
  return [{ label: BASE_FARE_LABEL, amount_rwf: reply.base }, ...reply.lines.map(toPriceLine)];
}

function toPriceLine(line: FareLine): PriceLine {
  return { label: line.label, amount_rwf: line.amount };
}
