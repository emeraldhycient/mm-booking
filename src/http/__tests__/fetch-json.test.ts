import { describe, expect, it } from 'vitest';
import { htmlPage, jsonResponse, scriptedFetch } from '../../__tests__/fixtures/scripted-fetch.js';
import { createFetchJson } from '../fetch-json.js';

const URL_UNDER_TEST = 'https://script.google.com/macros/s/TEST/exec';

describe('fetchJson', () => {
  it('returns the parsed JSON of a successful reply', async () => {
    const { fetchImpl } = scriptedFetch([jsonResponse({ ok: true })]);

    const reply = await createFetchJson(fetchImpl)(URL_UNDER_TEST, { timeoutMs: 1000, tries: 1 });

    expect(reply).toEqual({ ok: true });
  });

  it('retries a failed call and returns the later success', async () => {
    const { calls, fetchImpl } = scriptedFetch([new TypeError('fetch failed'), jsonResponse({ ok: true })]);

    const reply = await createFetchJson(fetchImpl)(URL_UNDER_TEST, { timeoutMs: 1000, tries: 2 });

    expect(reply).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
  });

  it('turns an HTML error page into UPSTREAM_UNAVAILABLE after the last try', async () => {
    const { calls, fetchImpl } = scriptedFetch([htmlPage(), htmlPage(), htmlPage()]);

    const attempt = createFetchJson(fetchImpl)(URL_UNDER_TEST, { timeoutMs: 1000, tries: 3 });

    await expect(attempt).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE', status: 504 });
    expect(calls).toHaveLength(3);
  });

  it('treats a non-2xx reply as a failure worth retrying', async () => {
    const { calls, fetchImpl } = scriptedFetch([jsonResponse({}, 500), jsonResponse({ ok: true })]);

    const reply = await createFetchJson(fetchImpl)(URL_UNDER_TEST, { timeoutMs: 1000, tries: 2 });

    expect(reply).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
  });

  it('stops after one try when tries is 1', async () => {
    const { calls, fetchImpl } = scriptedFetch([new TypeError('fetch failed')]);

    const attempt = createFetchJson(fetchImpl)(URL_UNDER_TEST, { timeoutMs: 1000, tries: 1 });

    await expect(attempt).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
    expect(calls).toHaveLength(1);
  });

  it('posts a body as text/plain JSON with a timeout signal and our user agent', async () => {
    const { calls, fetchImpl } = scriptedFetch([jsonResponse({ ok: true })]);

    await createFetchJson(fetchImpl)(URL_UNDER_TEST, { method: 'POST', body: '{"a":1}', timeoutMs: 1000, tries: 1 });

    const [, init] = calls[0]!;
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toMatchObject({ 'Content-Type': 'text/plain;charset=utf-8', 'User-Agent': expect.stringMatching(/^MovingMan/) });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
