import type { FareLine } from './fare-line.type.js';

export interface ScriptQuoteReply {
  ok: boolean;
  error?: string;
  inArea?: boolean;
  km?: number;
  mins?: number;
  source?: string;
  fee?: number;
  base?: number;
  lines?: FareLine[];
}
