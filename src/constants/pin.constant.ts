export const PIN_PATTERN = {
  COORDS: /^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/,
  URL: /^https?:\/\//i,
  BARE_MAPS_LINK: /^(?:maps\.app\.goo\.gl|goo\.gl|maps\.google\.[a-z.]+|(?:www\.)?google\.[a-z.]+)\//i,
  PLUS_CODE: /([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,3})/,
} as const;

export const MAX_ABS_LAT = 90;
export const MAX_ABS_LNG = 180;
export const HTTPS_PREFIX = 'https://';
export const PIN_KIND = { COORDS: 'coords', LINK: 'link', PLUS: 'plus' } as const;
export const PIN_SOURCE = { PROVIDED: 'provided', GEOCODED: 'geocoded', RECORDED: 'recorded' } as const;
export const LOCATION_PREFIX = { RESTAURANT: 'restaurant', RECEIVER: 'receiver' } as const;
export const PIN_FIELD_SUFFIX = '_pin';
export const ADDRESS_FIELD_SUFFIX = '_address';
