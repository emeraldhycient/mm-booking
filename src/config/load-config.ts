import { CONFIG_MESSAGE, DEFAULT_PORT, INDEX_HTML_PATH, SCRIPT_URL_PATTERN } from '../constants/config.constant.js';
import type { AppConfig } from '../types/app-config.type.js';

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const scriptUrl = env.SCRIPT_URL?.trim() ?? '';
  if (!SCRIPT_URL_PATTERN.test(scriptUrl)) throw new Error(CONFIG_MESSAGE.SCRIPT_URL);
  return { scriptUrl, port: toPort(env.PORT), indexHtmlPath: INDEX_HTML_PATH };
}

function toPort(value: string | undefined): number {
  const port = Number(value ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port <= 0) throw new Error(CONFIG_MESSAGE.PORT);
  return port;
}
