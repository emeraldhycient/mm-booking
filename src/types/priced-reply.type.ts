import type { ScriptQuoteReply } from './script-quote-reply.type.js';

export type PricedReply = Pick<ScriptQuoteReply, 'fee' | 'km' | 'mins' | 'base' | 'lines'>;
