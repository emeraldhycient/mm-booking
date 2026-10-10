import type { FareLine } from './fare-line.type.js';
import type { RecordedRow } from './recorded-row.type.js';

export interface ScriptOrderReply {
  ok: boolean;
  error?: string;
  duplicate?: boolean;
  orderId?: string;
  fee?: number;
  km?: number;
  mins?: number;
  base?: number;
  lines?: FareLine[];
  row?: RecordedRow;
}
