import { fileURLToPath } from 'node:url';
import { createApp } from '../../app.js';
import { FakeClock } from './fake-clock.js';
import { FakeGeocoder } from './fake-geocoder.js';
import { FakeRouter } from './fake-router.js';
import { FakeScriptClient } from './fake-script-client.js';
import type { TestApp, TestAppOverrides } from './test-app.type.js';

export const INDEX_HTML_FIXTURE_PATH = fileURLToPath(new URL('../../../index.html', import.meta.url));

export function createTestApp(overrides: TestAppOverrides = {}): TestApp {
  const scriptClient = overrides.scriptClient ?? new FakeScriptClient();
  const geocoder = overrides.geocoder ?? new FakeGeocoder();
  const router = overrides.router ?? new FakeRouter();
  const clock = overrides.clock ?? new FakeClock();
  const app = createApp({ scriptClient, geocoder, router, now: clock.now, indexHtmlPath: INDEX_HTML_FIXTURE_PATH });
  return { app, scriptClient, geocoder, router, clock };
}
