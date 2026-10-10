import { HTTP_METHOD } from '../constants/http.constant.js';
import { SCRIPT_ACTION, SCRIPT_CHANNEL, SCRIPT_OP, SCRIPT_PARAM } from '../constants/script.constant.js';
import { UPSTREAM_CALL } from '../constants/upstream.constant.js';
import type { FetchJson } from '../types/fetch-json.type.js';
import type { LatLng } from '../types/lat-lng.type.js';
import type { RoadRoute } from '../types/road-route.type.js';
import type { ScriptClient } from '../types/script-client.type.js';
import type { ScriptClientReply } from '../types/script-client-reply.type.js';
import type { ScriptOrderBody } from '../types/script-order-body.type.js';
import type { ScriptOrderReply } from '../types/script-order-reply.type.js';
import type { ScriptQuoteReply } from '../types/script-quote-reply.type.js';
import type { ScriptResolveReply } from '../types/script-resolve-reply.type.js';
import type { TripLeg } from '../types/trip-leg.type.js';
import type { UpstreamCall } from '../types/upstream-call.type.js';

export class AppsScriptClient implements ScriptClient {
  constructor(
    private readonly scriptUrl: string,
    private readonly fetchJson: FetchJson,
  ) {}

  async lookupClient(apiKey: string): Promise<ScriptClientReply> {
    const payload = { channel: SCRIPT_CHANNEL, op: SCRIPT_OP.CLIENT, apiKey };
    return (await this.post(payload, UPSTREAM_CALL.CLIENT_LOOKUP)) as ScriptClientReply;
  }

  async quote(from: LatLng, to: LatLng, route: RoadRoute | null): Promise<ScriptQuoteReply> {
    return (await this.fetchJson(quoteUrl(this.scriptUrl, { from, to, route }), UPSTREAM_CALL.QUOTE)) as ScriptQuoteReply;
  }

  async resolve(link: string): Promise<ScriptResolveReply> {
    const query = new URLSearchParams({ [SCRIPT_PARAM.ACTION]: SCRIPT_ACTION.RESOLVE, [SCRIPT_PARAM.URL]: link });
    return (await this.fetchJson(`${this.scriptUrl}?${query}`, UPSTREAM_CALL.RESOLVE)) as ScriptResolveReply;
  }

  async placeOrder(body: ScriptOrderBody): Promise<ScriptOrderReply> {
    return (await this.post(body, UPSTREAM_CALL.ORDER)) as ScriptOrderReply;
  }

  private post(payload: object, call: UpstreamCall): Promise<unknown> {
    return this.fetchJson(this.scriptUrl, { ...call, method: HTTP_METHOD.POST, body: JSON.stringify(payload) });
  }
}

function quoteUrl(scriptUrl: string, trip: TripLeg): string {
  const query = new URLSearchParams({
    [SCRIPT_PARAM.ACTION]: SCRIPT_ACTION.QUOTE,
    [SCRIPT_PARAM.PICKUP_LAT]: String(trip.from.lat),
    [SCRIPT_PARAM.PICKUP_LNG]: String(trip.from.lng),
    [SCRIPT_PARAM.DROP_LAT]: String(trip.to.lat),
    [SCRIPT_PARAM.DROP_LNG]: String(trip.to.lng),
  });
  if (trip.route) {
    query.set(SCRIPT_PARAM.ROAD_KM, String(trip.route.km));
    query.set(SCRIPT_PARAM.ROAD_MINUTES, String(trip.route.mins));
  }
  return `${scriptUrl}?${query}`;
}
