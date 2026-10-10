import { fileURLToPath } from 'node:url';

export const DEFAULT_PORT = 3000;
export const SCRIPT_URL_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;
export const INDEX_HTML_PATH = fileURLToPath(new URL('../../index.html', import.meta.url));
export const CONFIG_MESSAGE = {
  SCRIPT_URL: 'SCRIPT_URL must be the client API deployment URL, https://script.google.com/macros/s/<id>/exec.',
  PORT: 'PORT must be a positive whole number.',
} as const;
