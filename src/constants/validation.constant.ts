export const FIELD_LIMIT = {
  COMPANY_MIN: 1,
  COMPANY_MAX: 60,
  NAME_MIN: 2,
  NAME_MAX: 60,
  ADDRESS_MIN: 2,
  ADDRESS_MAX: 80,
  REFERENCE_MIN: 1,
  REFERENCE_MAX: 40,
  PIN_MAX: 300,
  NOTES_MAX: 200,
} as const;

export const FIELD = { BOOKING_COMPANY: 'booking_company', PAY_METHOD: 'pay_method' } as const;
export const FIELD_PATH_SEPARATOR = '.';
export const ROOT_FIELD = 'body';
export const EXTERNAL_REFERENCE_PATTERN = /^[A-Za-z0-9._-]+$/;

export const RWANDA_PHONE = {
  NON_DIGITS: /\D/g,
  COUNTRY_PREFIX: '250',
  TRUNK_PREFIX: '0',
  MOBILE_PATTERN: /^7[2389]\d{7}$/,
} as const;

export const PICKUP_WINDOW = { PAST_GRACE_MS: 2 * 60 * 60_000, MAX_AHEAD_MS: 30 * 24 * 60 * 60_000 } as const;
export const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/;
export const ISO_GROUP = { YEAR: 1, MONTH: 2, DAY: 3, ZONE: 6 } as const;
export const MONTHS_IN_YEAR = 12;
export const DATE_LOCALE = 'en-CA';

export const VALIDATION_MESSAGE = {
  PHONE: 'Enter a Rwandan mobile number, e.g. 078 123 4567.',
  ITEM_TYPE: 'Use one of Food, Documents, Clothes, Laundry, Electronics, Other.',
  PIN: 'Use "lat,lng", a Google Maps link or a plus code.',
  REFERENCE: 'Use letters, digits, dot, underscore or hyphen.',
  ACCOUNT_PAYER: 'Account payment is only for deliveries the sender pays for.',
  PICKUP_FORMAT: 'Use "now" or an ISO-8601 time such as 2026-10-10T14:30 (Kigali time) or 2026-10-10T12:30:00Z.',
  PICKUP_PAST: 'Pickup time is more than 2 hours in the past.',
  PICKUP_TOO_FAR: 'Pickup time is more than 30 days ahead.',
} as const;
