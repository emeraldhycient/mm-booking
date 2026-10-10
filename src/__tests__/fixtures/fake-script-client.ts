import type { LatLng } from '../../types/lat-lng.type.js';
import type { RoadRoute } from '../../types/road-route.type.js';
import type { ScriptClient } from '../../types/script-client.type.js';
import type { ScriptClientReply } from '../../types/script-client-reply.type.js';
import type { ScriptOrderBody } from '../../types/script-order-body.type.js';
import type { ScriptOrderReply } from '../../types/script-order-reply.type.js';
import type { ScriptQuoteReply } from '../../types/script-quote-reply.type.js';
import type { ScriptResolveReply } from '../../types/script-resolve-reply.type.js';
import type { ScriptCalls, ScriptFailures } from './fake-script-client.type.js';
import { DOSTEON, ORDER_REPLY_NEW, QUOTE_7_26_KM, RESOLVED_LINK } from './script-replies.js';

export class FakeScriptClient implements ScriptClient {
  clientReply: ScriptClientReply = { ok: true, client: DOSTEON };
  quoteReply: ScriptQuoteReply = QUOTE_7_26_KM;
  resolveReply: ScriptResolveReply = RESOLVED_LINK;
  orderReply: ScriptOrderReply = ORDER_REPLY_NEW;
  readonly failures: ScriptFailures = {};
  readonly calls: ScriptCalls = { lookupClient: [], quote: [], resolve: [], placeOrder: [] };

  async lookupClient(apiKey: string): Promise<ScriptClientReply> {
    this.calls.lookupClient.push(apiKey);
    return this.answer('lookupClient', this.clientReply);
  }

  async quote(from: LatLng, to: LatLng, route: RoadRoute | null): Promise<ScriptQuoteReply> {
    this.calls.quote.push({ from, to, route });
    return this.answer('quote', this.quoteReply);
  }

  async resolve(link: string): Promise<ScriptResolveReply> {
    this.calls.resolve.push(link);
    return this.answer('resolve', this.resolveReply);
  }

  async placeOrder(body: ScriptOrderBody): Promise<ScriptOrderReply> {
    this.calls.placeOrder.push(body);
    return this.answer('placeOrder', this.orderReply);
  }

  private answer<T>(method: keyof ScriptClient, reply: T): T {
    const failure = this.failures[method];
    if (failure) throw failure;
    return structuredClone(reply);
  }
}
