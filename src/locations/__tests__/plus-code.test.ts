import { describe, expect, it } from 'vitest';
import { recoverPlusCode } from '../plus-code.js';

describe('recoverPlusCode', () => {
  it('recovers a short code near Kigali to the pin the Requests sheet wrote it for', () => {
    const point = recoverPlusCode('34CQ+JF');

    expect(point?.lat).toBeCloseTo(-1.928438, 5);
    expect(point?.lng).toBeCloseTo(30.138687, 5);
  });

  it('decodes a full code to the same place', () => {
    const point = recoverPlusCode('6GCG34CQ+JF');

    expect(point?.lat).toBeCloseTo(-1.928438, 5);
  });

  it('returns null for a code that is not valid', () => {
    const point = recoverPlusCode('ZZ+ZZ');

    expect(point).toBeNull();
  });
});
