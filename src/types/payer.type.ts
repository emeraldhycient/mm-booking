import type { PAYERS } from '../constants/booking.constant.js';

export type Payer = (typeof PAYERS)[number];
