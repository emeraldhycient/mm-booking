import type { PickupWhen } from './pickup-when.type.js';

export type PickupWhenResult = { ok: true; value: PickupWhen } | { ok: false; message: string };
