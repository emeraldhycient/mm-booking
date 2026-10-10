import { describe, expect, it } from 'vitest';
import { toLocalRwandaMobile } from '../rwanda-phone.js';

describe('toLocalRwandaMobile', () => {
  it.each([
    ['0781234567', '0781234567'],
    ['+250 78 123 4567', '0781234567'],
    ['250781234567', '0781234567'],
    ['781234567', '0781234567'],
    ['072-123-4567', '0721234567'],
  ])('reads %s as %s', (input, expected) => {
    const phone = toLocalRwandaMobile(input);

    expect(phone).toBe(expected);
  });

  it.each(['0751234567', '07812345', '', 'call me'])('refuses %s', (input) => {
    const phone = toLocalRwandaMobile(input);

    expect(phone).toBeNull();
  });
});
