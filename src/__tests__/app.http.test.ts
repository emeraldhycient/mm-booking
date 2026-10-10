import { readFileSync } from 'node:fs';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { INDEX_HTML_FIXTURE_PATH, createTestApp } from './fixtures/test-app.js';

describe('the web app', () => {
  it('serves the booking page byte for byte at /', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/html/);
    expect(response.text).toBe(readFileSync(INDEX_HTML_FIXTURE_PATH, 'utf8'));
  });

  it('does not serve repository files such as package.json', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/package.json');

    expect(response.status).toBe(404);
  });

  it('answers an unknown API path with a JSON 404', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/api/nope').send({});

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ ok: false, error: { code: 'NOT_FOUND', message: 'No such endpoint.' } });
  });
});
