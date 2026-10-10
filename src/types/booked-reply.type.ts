import type { RecordedRow } from './recorded-row.type.js';
import type { ScriptOrderReply } from './script-order-reply.type.js';

export interface BookedReply extends ScriptOrderReply {
  orderId: string;
  row: RecordedRow;
}
