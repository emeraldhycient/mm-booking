import { HTTPS_PREFIX, MAX_ABS_LAT, MAX_ABS_LNG, PIN_KIND, PIN_PATTERN } from '../constants/pin.constant.js';
import type { ParsedPin } from '../types/parsed-pin.type.js';

export function parsePin(text: string): ParsedPin | null {
  const value = text.trim();
  return coordsPin(value) ?? linkPin(value) ?? plusCodePin(value);
}

function coordsPin(value: string): ParsedPin | null {
  const match = PIN_PATTERN.COORDS.exec(value);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Math.abs(lat) > MAX_ABS_LAT || Math.abs(lng) > MAX_ABS_LNG) return null;
  return { kind: PIN_KIND.COORDS, point: { lat, lng } };
}

function linkPin(value: string): ParsedPin | null {
  if (PIN_PATTERN.URL.test(value)) return { kind: PIN_KIND.LINK, url: value };
  if (PIN_PATTERN.BARE_MAPS_LINK.test(value)) return { kind: PIN_KIND.LINK, url: HTTPS_PREFIX + value };
  return null;
}

function plusCodePin(value: string): ParsedPin | null {
  const code = PIN_PATTERN.PLUS_CODE.exec(value.toUpperCase())?.[1];
  return code ? { kind: PIN_KIND.PLUS, code } : null;
}
