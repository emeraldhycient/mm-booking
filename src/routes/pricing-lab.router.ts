import { join } from 'node:path';
import express, { type RequestHandler, type Router } from 'express';
import { PRICING_LAB_PAGE } from '../constants/config.constant.js';
import { HTTP_STATUS, ROBOTS_HEADER } from '../constants/http.constant.js';
import { createIndexPageHandler } from './index-page.route.js';

export function createPricingLabRouter(labDir: string): Router {
  const router = express.Router();
  router.use(markNoIndex);
  router.get('/', createIndexPageHandler(join(labDir, PRICING_LAB_PAGE)));
  router.use(express.static(labDir, { index: false }));
  router.use(rejectMissingLabFile);
  return router;
}

const markNoIndex: RequestHandler = function markNoIndex(_req, res, next) {
  res.setHeader(ROBOTS_HEADER.NAME, ROBOTS_HEADER.NO_INDEX);
  next();
};

const rejectMissingLabFile: RequestHandler = function rejectMissingLabFile(_req, res) {
  res.sendStatus(HTTP_STATUS.NOT_FOUND);
};
