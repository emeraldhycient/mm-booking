import type { ScriptErrorMapping } from '../types/script-error-mapping.type.js';
import { DETAIL_MESSAGE, ERROR_CODE } from './error.constant.js';

export const SCRIPT_CHANNEL = 'api';
export const SCRIPT_OP = { CLIENT: 'client', ORDER: 'order' } as const;
export const SCRIPT_ACTION = { QUOTE: 'quote', RESOLVE: 'resolve' } as const;
export const SCRIPT_PARAM = {
  ACTION: 'action',
  PICKUP_LAT: 'pLat',
  PICKUP_LNG: 'pLng',
  DROP_LAT: 'dLat',
  DROP_LNG: 'dLng',
  ROAD_KM: 'rk',
  ROAD_MINUTES: 'rm',
  URL: 'url',
} as const;

export const SCRIPT_ERROR_MAP: Record<string, ScriptErrorMapping> = {
  unauthorized: { code: ERROR_CODE.UNAUTHORIZED },
  disabled: { code: ERROR_CODE.CLIENT_DISABLED },
  misconfigured: { code: ERROR_CODE.INTERNAL, message: DETAIL_MESSAGE.CLIENT_MISCONFIGURED },
  paused: { code: ERROR_CODE.NOT_ACCEPTING_ORDERS },
  outside: { code: ERROR_CODE.OUTSIDE_SERVICE_AREA },
};
