import type { RequestHandler } from 'express';

export function createIndexPageHandler(indexHtmlPath: string): RequestHandler {
  return function sendIndexPage(_req, res) {
    res.sendFile(indexHtmlPath);
  };
}
