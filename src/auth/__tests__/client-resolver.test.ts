import { describe, expect, it } from 'vitest';
import { FakeClock } from '../../__tests__/fixtures/fake-clock.js';
import { FakeScriptClient } from '../../__tests__/fixtures/fake-script-client.js';
import { DOSTEON } from '../../__tests__/fixtures/script-replies.js';
import { ApiError } from '../../errors/api-error.js';
import { createClientResolver } from '../client-resolver.js';

function setup() {
  const scriptClient = new FakeScriptClient();
  const clock = new FakeClock();
  return { scriptClient, clock, resolver: createClientResolver({ scriptClient, now: clock.now }) };
}

describe('the client resolver', () => {
  it('asks the script once and reuses the answer for a minute', async () => {
    const { scriptClient, clock, resolver } = setup();

    await resolver.resolve('mm_key');
    clock.advance(59_000);
    const client = await resolver.resolve('mm_key');

    expect(client).toEqual(DOSTEON);
    expect(scriptClient.calls.lookupClient).toHaveLength(1);
  });

  it('asks again once the minute is up', async () => {
    const { scriptClient, clock, resolver } = setup();

    await resolver.resolve('mm_key');
    clock.advance(60_001);
    await resolver.resolve('mm_key');

    expect(scriptClient.calls.lookupClient).toHaveLength(2);
  });

  it('remembers an unknown key for a minute too', async () => {
    const { scriptClient, resolver } = setup();
    scriptClient.clientReply = { ok: false, error: 'unauthorized' };

    await expect(resolver.resolve('mm_bad')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    await expect(resolver.resolve('mm_bad')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });

    expect(scriptClient.calls.lookupClient).toHaveLength(1);
  });

  it('does not remember a lookup that failed to reach the script', async () => {
    const { scriptClient, resolver } = setup();
    scriptClient.failures.lookupClient = new ApiError('UPSTREAM_UNAVAILABLE');

    await expect(resolver.resolve('mm_key')).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
    delete scriptClient.failures.lookupClient;
    const client = await resolver.resolve('mm_key');

    expect(client).toEqual(DOSTEON);
  });

  it('does not remember a misconfigured client, so a fix shows at once', async () => {
    const { scriptClient, resolver } = setup();
    scriptClient.clientReply = { ok: false, error: 'misconfigured' };

    await expect(resolver.resolve('mm_key')).rejects.toMatchObject({ code: 'INTERNAL' });
    scriptClient.clientReply = { ok: true, client: DOSTEON };
    const client = await resolver.resolve('mm_key');

    expect(client).toEqual(DOSTEON);
  });
});
