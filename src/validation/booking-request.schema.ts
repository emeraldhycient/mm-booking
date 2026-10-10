import { z } from 'zod';
import {
  ACCOUNT_PAYER, ACCOUNT_PAY_METHOD, DEFAULT_SIZE, ITEM_TYPES, PAYERS, PAY_METHODS, SIZES,
} from '../constants/booking.constant.js';
import { EXTERNAL_REFERENCE_PATTERN, FIELD, FIELD_LIMIT, VALIDATION_MESSAGE } from '../constants/validation.constant.js';
import { parsePin } from '../locations/parse-pin.js';
import type { AccountCheck } from '../types/account-check.type.js';
import type { ItemType } from '../types/item-type.type.js';
import type { PickupWhen } from '../types/pickup-when.type.js';
import { toPickupWhen } from './pickup-time.js';
import { toLocalRwandaMobile } from './rwanda-phone.js';

function blankToUndefined(value: unknown): unknown {
  return value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value;
}

function boundedText(min: number, max: number) {
  return z.string().trim().min(min).max(max);
}

function lowercaseChoice<const T extends readonly [string, ...string[]]>(values: T) {
  return z.string().trim().toLowerCase().pipe(z.enum(values));
}

function isParsablePin(value: string): boolean {
  return parsePin(value) !== null;
}

function toPhoneOrIssue(value: string, ctx: z.RefinementCtx): string {
  const phone = toLocalRwandaMobile(value);
  if (phone) return phone;
  ctx.addIssue({ code: 'custom', message: VALIDATION_MESSAGE.PHONE });
  return z.NEVER;
}

function toItemTypeOrIssue(value: string, ctx: z.RefinementCtx): ItemType {
  const item = ITEM_TYPES.find((type) => type.toLowerCase() === value.trim().toLowerCase());
  if (item) return item;
  ctx.addIssue({ code: 'custom', message: VALIDATION_MESSAGE.ITEM_TYPE });
  return z.NEVER;
}

function pickupWhenOrIssue(now: Date) {
  return function toPickupWhenOrIssue(value: string, ctx: z.RefinementCtx): PickupWhen {
    const result = toPickupWhen(value, now);
    if (result.ok) return result.value;
    ctx.addIssue({ code: 'custom', message: result.message });
    return z.NEVER;
  };
}

function checkAccountPayer(request: AccountCheck, ctx: z.RefinementCtx): void {
  if (request.pay_method !== ACCOUNT_PAY_METHOD || request.payer === ACCOUNT_PAYER) return;
  ctx.addIssue({ code: 'custom', path: [FIELD.PAY_METHOD], message: VALIDATION_MESSAGE.ACCOUNT_PAYER });
}

const optionalPin = z.preprocess(
  blankToUndefined,
  z.string().trim().max(FIELD_LIMIT.PIN_MAX).refine(isParsablePin, VALIDATION_MESSAGE.PIN).optional(),
);
const phone = z.string().transform(toPhoneOrIssue);

export const quoteRequestSchema = z.object({
  booking_company: boundedText(FIELD_LIMIT.COMPANY_MIN, FIELD_LIMIT.COMPANY_MAX),
  restaurant_name: boundedText(FIELD_LIMIT.NAME_MIN, FIELD_LIMIT.NAME_MAX),
  restaurant_address: boundedText(FIELD_LIMIT.ADDRESS_MIN, FIELD_LIMIT.ADDRESS_MAX),
  restaurant_pin: optionalPin,
  receiver_address: boundedText(FIELD_LIMIT.ADDRESS_MIN, FIELD_LIMIT.ADDRESS_MAX),
  receiver_pin: optionalPin,
});

export function createBookingRequestSchema(now: Date) {
  return quoteRequestSchema
    .extend({
      external_reference: boundedText(FIELD_LIMIT.REFERENCE_MIN, FIELD_LIMIT.REFERENCE_MAX)
        .regex(EXTERNAL_REFERENCE_PATTERN, VALIDATION_MESSAGE.REFERENCE),
      restaurant_phone: z.preprocess(blankToUndefined, phone.optional()),
      item_type: z.string().transform(toItemTypeOrIssue),
      receiver_name: boundedText(FIELD_LIMIT.NAME_MIN, FIELD_LIMIT.NAME_MAX),
      receiver_phone: phone,
      pickup_time: z.string().transform(pickupWhenOrIssue(now)),
      payer: lowercaseChoice(PAYERS),
      pay_method: lowercaseChoice(PAY_METHODS),
      size: z.preprocess(blankToUndefined, lowercaseChoice(SIZES).default(DEFAULT_SIZE)),
      notes: z.preprocess(blankToUndefined, z.string().trim().max(FIELD_LIMIT.NOTES_MAX).optional()),
    })
    .superRefine(checkAccountPayer);
}
