import { describe, expect, it } from 'vitest';
import { toPickupWhen } from '../pickup-time.js';

const NOW = new Date('2026-10-10T12:00:00Z');

describe('toPickupWhen', () => {
  it.each(['now', 'NOW', ' Now '])('reads %s as as soon as possible', (input) => {
    const result = toPickupWhen(input, NOW);

    expect(result).toEqual({ ok: true, value: { when: 'now', whenAt: '' } });
  });

  it('reads a time without an offset as Kigali time', () => {
    const result = toPickupWhen('2026-10-10T16:30', NOW);

    expect(result).toEqual({ ok: true, value: { when: 'later', whenAt: '2026-10-10T16:30' } });
  });

  it('keeps a Kigali offset time as it is', () => {
    const result = toPickupWhen('2026-10-10T16:30:00+02:00', NOW);

    expect(result).toEqual({ ok: true, value: { when: 'later', whenAt: '2026-10-10T16:30' } });
  });

  it('records a UTC time as Kigali time across midnight', () => {
    const result = toPickupWhen('2026-10-10T22:30:00Z', NOW);

    expect(result).toEqual({ ok: true, value: { when: 'later', whenAt: '2026-10-11T00:30' } });
  });

  it('treats a time a few minutes ago as as soon as possible', () => {
    const result = toPickupWhen('2026-10-10T11:57:00Z', NOW);

    expect(result).toEqual({ ok: true, value: { when: 'now', whenAt: '' } });
  });

  it('treats a time up to two hours ago as as soon as possible, so a late retry still books', () => {
    const result = toPickupWhen('2026-10-10T10:01:00Z', NOW);

    expect(result).toEqual({ ok: true, value: { when: 'now', whenAt: '' } });
  });

  it('refuses a time more than two hours ago', () => {
    const result = toPickupWhen('2026-10-10T09:59:00Z', NOW);

    expect(result).toEqual({ ok: false, message: 'Pickup time is more than 2 hours in the past.' });
  });

  it('refuses a time more than 30 days ahead', () => {
    const result = toPickupWhen('2026-11-10T12:00:01Z', NOW);

    expect(result).toEqual({ ok: false, message: 'Pickup time is more than 30 days ahead.' });
  });

  it.each(['tomorrow at 2', '2026-10-10 16:30', '2026-02-30T10:00', '2026-13-01T10:00', '2026-10-10T25:00'])(
    'refuses %s as not a valid time',
    (input) => {
      const result = toPickupWhen(input, NOW);

      expect(result).toMatchObject({ ok: false, message: expect.stringMatching(/^Use "now"/) });
    },
  );
});
