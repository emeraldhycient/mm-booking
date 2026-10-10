import { RECEIVER_ADDRESS, RESTAURANT_ADDRESS } from './geocode-hits.js';

export const API_KEY = 'mm_test_key';
export const FIXED_NOW = new Date('2026-10-10T12:00:00Z');

export function quotePayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    booking_company: 'Dosteon',
    restaurant_name: 'Test Restaurant',
    restaurant_address: RESTAURANT_ADDRESS,
    receiver_address: RECEIVER_ADDRESS,
    ...overrides,
  };
}

export function bookingPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...quotePayload(),
    external_reference: 'DOS-10422',
    restaurant_phone: '0780000003',
    item_type: 'Food',
    receiver_name: 'Test Receiver',
    receiver_phone: '0780000004',
    pickup_time: '2026-10-10T16:30',
    payer: 'sender',
    pay_method: 'account',
    notes: 'Ring at the gate',
    ...overrides,
  };
}
