import type { Payer } from './payer.type.js';
import type { PayMethod } from './pay-method.type.js';

export interface AccountCheck {
  payer: Payer;
  pay_method: PayMethod;
}
