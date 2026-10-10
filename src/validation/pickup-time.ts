import { PICKUP_ASAP, PICKUP_LATER, PICKUP_NOW } from '../constants/booking.constant.js';
import { KIGALI_TIME_ZONE, KIGALI_UTC_OFFSET } from '../constants/kigali.constant.js';
import { DATE_LOCALE, ISO_DATE_TIME, ISO_GROUP, MONTHS_IN_YEAR, PICKUP_WINDOW, VALIDATION_MESSAGE } from '../constants/validation.constant.js';
import type { PickupWhenResult } from '../types/pickup-when-result.type.js';

const KIGALI_MINUTE = new Intl.DateTimeFormat(DATE_LOCALE, {
  timeZone: KIGALI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function toPickupWhen(value: string, now: Date): PickupWhenResult {
  const text = value.trim();
  if (text.toLowerCase() === PICKUP_NOW) return { ok: true, value: { ...PICKUP_ASAP } };
  const at = parseIsoInKigali(text);
  if (!at) return { ok: false, message: VALIDATION_MESSAGE.PICKUP_FORMAT };
  const aheadMs = at.getTime() - now.getTime();
  if (aheadMs < -PICKUP_WINDOW.PAST_GRACE_MS) return { ok: false, message: VALIDATION_MESSAGE.PICKUP_PAST };
  if (aheadMs > PICKUP_WINDOW.MAX_AHEAD_MS) return { ok: false, message: VALIDATION_MESSAGE.PICKUP_TOO_FAR };
  if (aheadMs <= 0) return { ok: true, value: { ...PICKUP_ASAP } };
  return { ok: true, value: { when: PICKUP_LATER, whenAt: formatKigaliMinute(at) } };
}

function parseIsoInKigali(text: string): Date | null {
  const match = ISO_DATE_TIME.exec(text);
  if (!match || !isRealCalendarDay(match)) return null;
  const ms = Date.parse(match[ISO_GROUP.ZONE] ? text : text + KIGALI_UTC_OFFSET);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function isRealCalendarDay(match: RegExpExecArray): boolean {
  const year = Number(match[ISO_GROUP.YEAR]);
  const month = Number(match[ISO_GROUP.MONTH]);
  const day = Number(match[ISO_GROUP.DAY]);
  if (month < 1 || month > MONTHS_IN_YEAR) return false;
  return new Date(Date.UTC(year, month - 1, day)).getUTCDate() === day;
}

function formatKigaliMinute(at: Date): string {
  const parts = KIGALI_MINUTE.formatToParts(at);
  const date = `${partValue(parts, 'year')}-${partValue(parts, 'month')}-${partValue(parts, 'day')}`;
  return `${date}T${partValue(parts, 'hour')}:${partValue(parts, 'minute')}`;
}

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((part) => part.type === type)?.value ?? '';
}
