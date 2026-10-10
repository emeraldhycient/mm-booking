import type { RoadRoute } from './road-route.type.js';
import type { ScriptContact } from './script-contact.type.js';
import type { ScriptDetails } from './script-details.type.js';
import type { ScriptHandover } from './script-handover.type.js';
import type { ScriptStop } from './script-stop.type.js';

export interface ScriptOrderBody {
  channel: string;
  op: string;
  apiKey: string;
  clientRef: string;
  pickup: ScriptStop;
  drop: ScriptStop;
  size: string;
  when: string;
  whenAt: string;
  handover: ScriptHandover;
  receiver: ScriptContact;
  customer: ScriptContact;
  details: ScriptDetails;
  route: RoadRoute | null;
}
