import { describe, expect, it } from 'vitest';
import { loadConfig } from '../load-config.js';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbTEST-id_123/exec';

describe('loadConfig', () => {
  it('reads the script URL and port from the environment', () => {
    const config = loadConfig({ SCRIPT_URL, PORT: '8080' });

    expect(config).toMatchObject({ scriptUrl: SCRIPT_URL, port: 8080 });
    expect(config.indexHtmlPath).toMatch(/index\.html$/);
  });

  it('uses port 3000 when PORT is not set', () => {
    const config = loadConfig({ SCRIPT_URL });

    expect(config.port).toBe(3000);
  });

  it('refuses to start without a script URL', () => {
    const load = () => loadConfig({});

    expect(load).toThrow(/SCRIPT_URL/);
  });

  it('refuses a URL that is not an Apps Script deployment', () => {
    const load = () => loadConfig({ SCRIPT_URL: 'https://example.com/exec' });

    expect(load).toThrow(/SCRIPT_URL/);
  });

  it('refuses a port that is not a positive whole number', () => {
    const load = () => loadConfig({ SCRIPT_URL, PORT: 'abc' });

    expect(load).toThrow(/PORT/);
  });
});
