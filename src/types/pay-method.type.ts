import type { PAY_METHODS } from '../constants/booking.constant.js';

export type PayMethod = (typeof PAY_METHODS)[number];
