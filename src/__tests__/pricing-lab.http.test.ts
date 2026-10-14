import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp } from './fixtures/test-app.js';

const LAB_DIR = fileURLToPath(new URL('../../pricing-lab/', import.meta.url));
const LAB_HTML = readFileSync(`${LAB_DIR}index.html`, 'utf8');
const NO_INDEX = 'noindex, nofollow, noarchive';
const LAB_SCRIPT = /src="(\/pricing-lab\/assets\/[^"]+\.js)"/.exec(LAB_HTML)?.[1] ?? '';

describe('the pricing lab', () => {
  it('serves the built pricing lab byte for byte at /pricing-lab', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/pricing-lab');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/html/);
    expect(response.text).toBe(LAB_HTML);
  });

  it('serves the same page with a trailing slash', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/pricing-lab/');

    expect(response.text).toBe(LAB_HTML);
  });

  it('marks the page as not to be indexed, like the website does', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/pricing-lab');

    expect(response.headers['x-robots-tag']).toBe(NO_INDEX);
  });

  it('serves the script the page loads, also marked not to be indexed', async () => {
    const { app } = createTestApp();

    const response = await request(app).get(LAB_SCRIPT);

    expect(LAB_SCRIPT).not.toBe('');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/javascript/);
    expect(response.headers['x-robots-tag']).toBe(NO_INDEX);
  });

  it('answers a missing lab file with 404 instead of the page', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/pricing-lab/assets/missing.js');

    expect(response.status).toBe(404);
  });

  it('tells crawlers to stay out of the pricing lab', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/robots.txt');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/plain/);
    expect(response.text).toContain('Disallow: /pricing-lab');
  });

  it('leaves the booking page at / unchanged', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/');

    expect(response.text).not.toBe(LAB_HTML);
    expect(response.headers['x-robots-tag']).toBeUndefined();
  });
});
