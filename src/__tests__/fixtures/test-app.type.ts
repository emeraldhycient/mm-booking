import type { Express } from 'express';
import type { FakeClock } from './fake-clock.js';
import type { FakeGeocoder } from './fake-geocoder.js';
import type { FakeRouter } from './fake-router.js';
import type { FakeScriptClient } from './fake-script-client.js';

export interface TestApp {
  app: Express;
  scriptClient: FakeScriptClient;
  geocoder: FakeGeocoder;
  router: FakeRouter;
  clock: FakeClock;
}

export type TestAppOverrides = Partial<Omit<TestApp, 'app'>>;
