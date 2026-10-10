import { COORD_DECIMALS } from '../constants/kigali.constant.js';

export function roundCoordinate(value: number): number {
  return Number(value.toFixed(COORD_DECIMALS));
}
