import { describe, expect, it } from 'vitest';
import { toScriptApiError } from '../script-error.js';

describe('toScriptApiError', () => {
  it.each([
    ['unauthorized', 401, 'UNAUTHORIZED'],
    ['disabled', 403, 'CLIENT_DISABLED'],
    ['misconfigured', 500, 'INTERNAL'],
    ['paused', 503, 'NOT_ACCEPTING_ORDERS'],
    ['outside', 422, 'OUTSIDE_SERVICE_AREA'],
  ])('maps the script error %s to %i %s', (scriptError, status, code) => {
    const error = toScriptApiError(scriptError);

    expect(error).toMatchObject({ status, code });
  });

  it('tells a client with no dispatch phone to contact Moving Man', () => {
    const error = toScriptApiError('misconfigured');

    expect(error.message).toBe('This client is not fully set up. Contact Moving Man.');
  });

  it('passes any other script message on as a 502', () => {
    const error = toScriptApiError('Missing receiver details');

    expect(error).toMatchObject({ status: 502, code: 'UPSTREAM_REJECTED', message: 'Missing receiver details' });
  });

  it('does not mistake a built-in property name for a known error', () => {
    const error = toScriptApiError('toString');

    expect(error).toMatchObject({ status: 502, code: 'UPSTREAM_REJECTED' });
  });

  it('explains a refusal that came without a reason', () => {
    const error = toScriptApiError(undefined);

    expect(error.message).toBe('The booking service refused the request without a reason.');
  });
});
