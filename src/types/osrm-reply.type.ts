import type { OsrmRoute } from './osrm-route.type.js';

export interface OsrmReply {
  code: string;
  routes?: OsrmRoute[];
}
