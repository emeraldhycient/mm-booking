import { describe, expect, it } from 'vitest';
import { parsePin } from '../parse-pin.js';

describe('parsePin', () => {
  it.each(['-1.95,30.06', ' -1.95 , 30.06 '])('reads %s as coordinates', (input) => {
    const pin = parsePin(input);

    expect(pin).toEqual({ kind: 'coords', point: { lat: -1.95, lng: 30.06 } });
  });

  it('refuses coordinates outside the globe', () => {
    const pin = parsePin('91,30');

    expect(pin).toBeNull();
  });

  it('reads a Google Maps link', () => {
    const pin = parsePin('https://maps.app.goo.gl/abc123');

    expect(pin).toEqual({ kind: 'link', url: 'https://maps.app.goo.gl/abc123' });
  });

  it('adds https to a Maps link pasted without it', () => {
    const pin = parsePin('maps.app.goo.gl/abc123');

    expect(pin).toEqual({ kind: 'link', url: 'https://maps.app.goo.gl/abc123' });
  });

  it('reads a short plus code', () => {
    const pin = parsePin('34CQ+JF');

    expect(pin).toEqual({ kind: 'plus', code: '34CQ+JF' });
  });

  it('reads a lowercase plus code with its town after it', () => {
    const pin = parsePin('34cq+jf Kigali');

    expect(pin).toEqual({ kind: 'plus', code: '34CQ+JF' });
  });

  it('reads a full plus code', () => {
    const pin = parsePin('6GCG34CQ+JF');

    expect(pin).toEqual({ kind: 'plus', code: '6GCG34CQ+JF' });
  });

  it('returns null for words it cannot place', () => {
    const pin = parsePin('near the market');

    expect(pin).toBeNull();
  });
});
