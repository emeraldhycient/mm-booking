import type { LatLng } from './lat-lng.type.js';
import type { RoadRoute } from './road-route.type.js';
import type { ScriptClientReply } from './script-client-reply.type.js';
import type { ScriptOrderBody } from './script-order-body.type.js';
import type { ScriptOrderReply } from './script-order-reply.type.js';
import type { ScriptQuoteReply } from './script-quote-reply.type.js';
import type { ScriptResolveReply } from './script-resolve-reply.type.js';

export interface ScriptClient {
  lookupClient(apiKey: string): Promise<ScriptClientReply>;
  quote(from: LatLng, to: LatLng, route: RoadRoute | null): Promise<ScriptQuoteReply>;
  resolve(link: string): Promise<ScriptResolveReply>;
  placeOrder(body: ScriptOrderBody): Promise<ScriptOrderReply>;
}
