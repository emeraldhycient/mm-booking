import { describe, expect, it } from 'vitest';
import { quotePayload } from '../../__tests__/fixtures/payloads.js';
import { thrownBy } from '../../__tests__/fixtures/thrown-by.js';
import { quoteRequestSchema } from '../booking-request.schema.js';
import { parseBody } from '../parse-body.js';

describe('parseBody', () => {
  it('returns the parsed request when the body is valid', () => {
    const request = parseBody(quoteRequestSchema, quotePayload());

    expect(request.booking_company).toBe('Dosteon');
  });

  it('throws VALIDATION_FAILED listing each bad field', () => {
    const error = thrownBy(() => parseBody(quoteRequestSchema, quotePayload({ receiver_address: '', restaurant_name: 'x' })));

    expect(error).toMatchObject({
      code: 'VALIDATION_FAILED',
      fields: [
        { field: 'restaurant_name', message: expect.any(String) },
        { field: 'receiver_address', message: expect.any(String) },
      ],
    });
  });
});
