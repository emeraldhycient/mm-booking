import type { RequestHandler } from 'express';
import { ROBOTS_TXT, TEXT_PLAIN } from '../constants/http.constant.js';

export const sendRobotsTxt: RequestHandler = function sendRobotsTxt(_req, res) {
  res.type(TEXT_PLAIN).send(ROBOTS_TXT);
};
