import openLocationCode from 'open-location-code';
import { KIGALI_CENTER } from '../constants/kigali.constant.js';
import type { LatLng } from '../types/lat-lng.type.js';

const codec = new openLocationCode.OpenLocationCode();

export function recoverPlusCode(code: string): LatLng | null {
  if (!codec.isValid(code)) return null;
  const full = codec.isShort(code) ? codec.recoverNearest(code, KIGALI_CENTER.lat, KIGALI_CENTER.lng) : code;
  if (!codec.isFull(full)) return null;
  const area = codec.decode(full);
  return { lat: area.latitudeCenter, lng: area.longitudeCenter };
}
