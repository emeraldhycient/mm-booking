import { describe, expect, it } from 'vitest';
import { FIXED_NOW, bookingPayload, quotePayload } from '../../__tests__/fixtures/payloads.js';
import { createBookingRequestSchema, quoteRequestSchema } from '../booking-request.schema.js';

function parse(payload: Record<string, unknown>) {
  return createBookingRequestSchema(FIXED_NOW).safeParse(payload);
}

function failingFields(payload: Record<string, unknown>): string[] {
  const result = parse(payload);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('the booking request schema', () => {
  it('accepts a complete booking and normalises it', () => {
    const payload = bookingPayload({ restaurant_phone: '+250 78 000 0003', item_type: 'food', payer: 'SENDER', pay_method: 'Account' });

    const result = parse(payload);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      restaurant_phone: '0780000003',
      receiver_phone: '0780000004',
      item_type: 'Food',
      payer: 'sender',
      pay_method: 'account',
      size: 'small',
      pickup_time: { when: 'later', whenAt: '2026-10-10T16:30' },
    });
  });

  it('reports every failing field at once', () => {
    const payload = bookingPayload({ receiver_name: undefined, receiver_phone: '123', item_type: 'Furniture', pickup_time: 'soon' });

    const fields = failingFields(payload);

    expect(fields).toEqual(expect.arrayContaining(['receiver_name', 'receiver_phone', 'item_type', 'pickup_time']));
  });

  it('refuses account payment unless the sender pays', () => {
    const fields = failingFields(bookingPayload({ payer: 'receiver', pay_method: 'account' }));

    expect(fields).toEqual(['pay_method']);
  });

  it('refuses a large size because riders are on bikes', () => {
    const fields = failingFields(bookingPayload({ size: 'large' }));

    expect(fields).toEqual(['size']);
  });

  it('refuses an external reference with spaces', () => {
    const fields = failingFields(bookingPayload({ external_reference: 'DOS 1' }));

    expect(fields).toEqual(['external_reference']);
  });

  it('refuses a pin it cannot read', () => {
    const fields = failingFields(bookingPayload({ restaurant_pin: 'near the market' }));

    expect(fields).toEqual(['restaurant_pin']);
  });

  it('treats empty or null optional fields as absent', () => {
    const result = parse(bookingPayload({ restaurant_phone: '', receiver_pin: null, notes: '', size: '' }));

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ restaurant_phone: undefined, receiver_pin: undefined, notes: undefined, size: 'small' });
  });

  it('refuses notes longer than 200 characters', () => {
    const fields = failingFields(bookingPayload({ notes: 'x'.repeat(201) }));

    expect(fields).toEqual(['notes']);
  });

  it('refuses an address longer than the sheet keeps', () => {
    const fields = failingFields(bookingPayload({ receiver_address: 'x'.repeat(81) }));

    expect(fields).toEqual(['receiver_address']);
  });

  it('needs only the company and the locations for a quote', () => {
    const result = quoteRequestSchema.safeParse(quotePayload());

    expect(result.success).toBe(true);
  });
});
