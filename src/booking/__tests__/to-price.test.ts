import { describe, expect, it } from 'vitest';
import { ORDER_REPLY_REPEAT, QUOTE_7_26_KM } from '../../__tests__/fixtures/script-replies.js';
import { thrownBy } from '../../__tests__/fixtures/thrown-by.js';
import { toPrice } from '../to-price.js';

describe('toPrice', () => {
  it('turns a 7.26 km quote into 2018 RWF with the base fare first', () => {
    const price = toPrice(QUOTE_7_26_KM);

    expect(price).toEqual({
      amount_rwf: 2018,
      currency: 'RWF',
      distance_km: 7.26,
      est_minutes: 14,
      breakdown: [
        { label: 'Base fare', amount_rwf: 600 },
        { label: '5 km × 200 (0–5 km)', amount_rwf: 1000 },
        { label: '2.26 km × 185 (5–10 km)', amount_rwf: 418 },
      ],
    });
  });

  it('gives an empty breakdown for a repeat, which stores no base or lines', () => {
    const price = toPrice(ORDER_REPLY_REPEAT);

    expect(price).toMatchObject({ amount_rwf: 2018, breakdown: [] });
  });

  it.each([0, -600, 2018.5])('refuses a fee of %s instead of passing it on', (fee) => {
    const error = thrownBy(() => toPrice({ fee, km: 7.26, mins: 14 }));

    expect(error).toMatchObject({ code: 'UPSTREAM_REJECTED', message: 'The booking service returned no price.' });
  });

  it('refuses a reply without a fee instead of pricing it at zero', () => {
    const error = thrownBy(() => toPrice({ km: 7.26, mins: 14 }));

    expect(error).toMatchObject({ code: 'UPSTREAM_REJECTED', message: 'The booking service returned no price.' });
  });
});
