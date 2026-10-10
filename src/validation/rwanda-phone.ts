import { RWANDA_PHONE } from '../constants/validation.constant.js';

export function toLocalRwandaMobile(value: string): string | null {
  let digits = value.replace(RWANDA_PHONE.NON_DIGITS, '');
  if (digits.startsWith(RWANDA_PHONE.COUNTRY_PREFIX)) digits = digits.slice(RWANDA_PHONE.COUNTRY_PREFIX.length);
  if (digits.startsWith(RWANDA_PHONE.TRUNK_PREFIX)) digits = digits.slice(RWANDA_PHONE.TRUNK_PREFIX.length);
  return RWANDA_PHONE.MOBILE_PATTERN.test(digits) ? RWANDA_PHONE.TRUNK_PREFIX + digits : null;
}
