import express, { type RequestHandler, type Router } from 'express';
import { createClientResolver } from '../auth/client-resolver.js';
import { createIpLimiter, createKeyLimiter } from '../auth/rate-limiters.js';
import { createRequireClient } from '../auth/require-client.js';
import { JSON_BODY_LIMIT, ROUTE } from '../constants/http.constant.js';
import type { AppDeps } from '../types/app-deps.type.js';
import { rejectUnknownApiRoute } from './not-found.route.js';
import { createQuoteHandler } from './quote.route.js';
import { createRequestHandler } from './request.route.js';
import { requireJsonObject } from './require-json-object.js';

export function createApiRouter(deps: AppDeps): Router {
  const router = express.Router();
  const intake: RequestHandler[] = [
    express.json({ limit: JSON_BODY_LIMIT }),
    requireJsonObject,
    createRequireClient(createClientResolver(deps)),
  ];
  router.use(createIpLimiter());
  router.post(ROUTE.QUOTE, ...intake, createKeyLimiter(), createQuoteHandler(deps));
  router.post(ROUTE.REQUEST, ...intake, createKeyLimiter(), createRequestHandler(deps));
  router.use(rejectUnknownApiRoute);
  return router;
}
