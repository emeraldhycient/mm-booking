import type { Clock } from './clock.type.js';
import type { Geocoder } from './geocoder.type.js';
import type { RoadRouter } from './road-router.type.js';
import type { ScriptClient } from './script-client.type.js';

export interface AppDeps {
  scriptClient: ScriptClient;
  geocoder: Geocoder;
  router: RoadRouter;
  now: Clock;
  indexHtmlPath: string;
}
