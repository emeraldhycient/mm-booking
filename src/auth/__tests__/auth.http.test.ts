import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { API_KEY, quotePayload } from '../../__tests__/fixtures/payloads.js';
import { createTestApp } from '../../__tests__/fixtures/test-app.js';

function quote(app: Parameters<typeof request>[0], body: object = quotePayload()) {
  return request(app).post('/api/quote').set('x-api-key', API_KEY).send(body);
}

describe('API authentication and limits', () => {
  it('refuses a request without an API key and does not ask the script', async () => {
    const { app, scriptClient } = createTestApp();

    const response = await request(app).post('/api/quote').send(quotePayload());

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(scriptClient.calls.lookupClient).toEqual([]);
  });

  it('refuses a key the API Clients tab does not have', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.clientReply = { ok: false, error: 'unauthorized' };

    const response = await quote(app);

    expect(response.status).toBe(401);
  });

  it('refuses a disabled client', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.clientReply = { ok: false, error: 'disabled' };

    const response = await quote(app);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CLIENT_DISABLED');
  });

  it('answers 500 for a client set up without a valid dispatch phone', async () => {
    const { app, scriptClient } = createTestApp();
    scriptClient.clientReply = { ok: false, error: 'misconfigured' };

    const response = await quote(app);

    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('This client is not fully set up. Contact Moving Man.');
  });

  it("refuses a booking_company that is not the key's business", async () => {
    const { app } = createTestApp();

    const response = await quote(app, quotePayload({ booking_company: 'Other Co' }));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('COMPANY_MISMATCH');
  });

  it('matches booking_company without regard to case or spaces', async () => {
    const { app } = createTestApp();

    const response = await quote(app, quotePayload({ booking_company: ' dosteon ' }));

    expect(response.status).toBe(200);
  });

  it('limits one key to 30 quotes a minute', async () => {
    const { app } = createTestApp();
    for (let i = 0; i < 30; i += 1) await quote(app);

    const response = await quote(app);

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('RATE_LIMITED');
  });

  it('limits one address to 60 API requests a minute', async () => {
    const { app } = createTestApp();
    for (let i = 0; i < 60; i += 1) await request(app).post('/api/quote').set('x-forwarded-for', '203.0.113.1').send({});

    const response = await request(app).post('/api/quote').set('x-forwarded-for', '203.0.113.1').send({});

    expect(response.status).toBe(429);
  });

  it('counts each forwarded client address separately behind the proxy', async () => {
    const { app } = createTestApp();
    for (let i = 0; i < 60; i += 1) await request(app).post('/api/quote').set('x-forwarded-for', '203.0.113.1').send({});

    const response = await request(app).post('/api/quote').set('x-forwarded-for', '203.0.113.2').send({});

    expect(response.status).toBe(401);
  });

  it('refuses a body that is not valid JSON', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/api/quote').set('x-api-key', API_KEY).set('content-type', 'application/json').send('{bad');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });

  it('refuses JSON sent without a JSON content type', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/api/quote').set('x-api-key', API_KEY).set('content-type', 'text/plain').send('{}');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });

  it('refuses a body over 10 kB', async () => {
    const { app } = createTestApp();

    const response = await quote(app, quotePayload({ notes: 'x'.repeat(11_000) }));

    expect(response.status).toBe(400);
  });

  it('refuses a JSON array body', async () => {
    const { app } = createTestApp();

    const response = await quote(app, []);

    expect(response.status).toBe(400);
  });
});
