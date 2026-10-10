import type { ScriptedFetch } from './scripted-fetch.type.js';

export function scriptedFetch(outcomes: Array<Response | Error>): ScriptedFetch {
  const calls: Array<[string, RequestInit]> = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push([url, init]);
    const next = outcomes.shift();
    if (!next || next instanceof Error) throw next ?? new Error('no scripted response left');
    return next;
  }) as typeof fetch;
  return { calls, fetchImpl };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

export function htmlPage(): Response {
  return new Response('<html><body>Google Apps Script error</body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
}
