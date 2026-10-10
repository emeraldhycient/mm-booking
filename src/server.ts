import { createApp } from './app.js';
import { currentTime } from './clock/current-time.js';
import { loadConfig } from './config/load-config.js';
import { LOG_EVENT, LOG_LEVEL } from './constants/log.constant.js';
import { createFetchJson } from './http/fetch-json.js';
import { createPhotonGeocoder } from './locations/photon-geocoder.js';
import { createOsrmRouter } from './routing/osrm-router.js';
import { AppsScriptClient } from './script/apps-script-client.js';

const config = loadConfig(process.env);
const fetchJson = createFetchJson();
const app = createApp({
  scriptClient: new AppsScriptClient(config.scriptUrl, fetchJson),
  geocoder: createPhotonGeocoder(fetchJson),
  router: createOsrmRouter(fetchJson),
  now: currentTime,
  indexHtmlPath: config.indexHtmlPath,
});

app.listen(config.port, function announceListening() {
  console.info(JSON.stringify({ level: LOG_LEVEL.INFO, event: LOG_EVENT.LISTENING, port: config.port }));
});
