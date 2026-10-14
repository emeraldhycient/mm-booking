import express, { type Express } from 'express';
import { PRICING_LAB_DIR } from './constants/config.constant.js';
import { ROUTE, TRUST_PROXY_HOPS } from './constants/http.constant.js';
import { handleError } from './errors/error-handler.js';
import { createApiRouter } from './routes/api.router.js';
import { createIndexPageHandler } from './routes/index-page.route.js';
import { createPricingLabRouter } from './routes/pricing-lab.router.js';
import { sendRobotsTxt } from './routes/robots.route.js';
import type { AppDeps } from './types/app-deps.type.js';

export function createApp(deps: AppDeps): Express {
  const app = express();
  app.set('trust proxy', TRUST_PROXY_HOPS);
  app.disable('x-powered-by');
  app.get(ROUTE.INDEX, createIndexPageHandler(deps.indexHtmlPath));
  app.get(ROUTE.ROBOTS, sendRobotsTxt);
  app.use(ROUTE.PRICING_LAB, createPricingLabRouter(PRICING_LAB_DIR));
  app.use(ROUTE.API, createApiRouter(deps));
  app.use(handleError);
  return app;
}
