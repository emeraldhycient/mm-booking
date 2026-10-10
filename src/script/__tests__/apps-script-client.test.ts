import { describe, expect, it } from 'vitest';
import { recordingFetchJson } from '../../__tests__/fixtures/recording-fetch-json.js';
import { AppsScriptClient } from '../apps-script-client.js';

const SCRIPT_URL = 'https://script.google.com/macros/s/TEST/exec';
const PICKUP = { lat: -1.93422, lng: 30.084892 };
const DROP = { lat: -1.929434, lng: 30.134337 };

function queryOf(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams);
}

describe('AppsScriptClient', () => {
  it('asks the script who owns a key with a POST', async () => {
    const { calls, fetchJson } = recordingFetchJson({ ok: true });

    await new AppsScriptClient(SCRIPT_URL, fetchJson).lookupClient('mm_key');

    const [url, options] = calls[0]!;
    expect(url).toBe(SCRIPT_URL);
    expect(options).toMatchObject({ method: 'POST', timeoutMs: 10_000, tries: 2 });
    expect(JSON.parse(options.body!)).toEqual({ channel: 'api', op: 'client', apiKey: 'mm_key' });
  });

  it('asks for a quote with both pins and the road distance', async () => {
    const { calls, fetchJson } = recordingFetchJson({ ok: true });

    await new AppsScriptClient(SCRIPT_URL, fetchJson).quote(PICKUP, DROP, { km: 7.2601, mins: 14 });

    const [url, options] = calls[0]!;
    expect(queryOf(url)).toEqual({
      action: 'quote', pLat: '-1.93422', pLng: '30.084892', dLat: '-1.929434', dLng: '30.134337', rk: '7.2601', rm: '14',
    });
    expect(options).toMatchObject({ timeoutMs: 10_000, tries: 3 });
  });

  it('asks for a quote without rk and rm when there is no road distance', async () => {
    const { calls, fetchJson } = recordingFetchJson({ ok: true });

    await new AppsScriptClient(SCRIPT_URL, fetchJson).quote(PICKUP, DROP, null);

    expect(Object.keys(queryOf(calls[0]![0]))).toEqual(['action', 'pLat', 'pLng', 'dLat', 'dLng']);
  });

  it('resolves a Maps link through the script resolve action', async () => {
    const { calls, fetchJson } = recordingFetchJson({ ok: true, lat: -1.95, lng: 30.06 });

    const reply = await new AppsScriptClient(SCRIPT_URL, fetchJson).resolve('https://maps.app.goo.gl/abc?x=1');

    expect(queryOf(calls[0]![0])).toEqual({ action: 'resolve', url: 'https://maps.app.goo.gl/abc?x=1' });
    expect(reply).toEqual({ ok: true, lat: -1.95, lng: 30.06 });
  });

  it('posts an order body as JSON with the order timeout and two tries', async () => {
    const { calls, fetchJson } = recordingFetchJson({ ok: true });
    const body = { channel: 'api', op: 'order', apiKey: 'mm_key', clientRef: 'DOS-1' };

    await new AppsScriptClient(SCRIPT_URL, fetchJson).placeOrder(body as never);

    const [, options] = calls[0]!;
    expect(options).toMatchObject({ method: 'POST', timeoutMs: 25_000, tries: 2 });
    expect(JSON.parse(options.body!)).toEqual(body);
  });
});
