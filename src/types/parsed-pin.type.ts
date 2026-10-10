import type { LatLng } from './lat-lng.type.js';

export type ParsedPin = { kind: 'coords'; point: LatLng } | { kind: 'link'; url: string } | { kind: 'plus'; code: string };
