import {
  HANDOVER_OTHER, NOTES_REFERENCE_PREFIX, NOTES_SEPARATOR, NO_NOTE, NO_WEIGHT, PAYER_LABEL, PAY_METHOD_LABEL, SIZE_LABEL,
} from '../constants/booking.constant.js';
import { SCRIPT_CHANNEL, SCRIPT_OP } from '../constants/script.constant.js';
import type { BookingRequest } from '../types/booking-request.type.js';
import type { OrderInput } from '../types/order-input.type.js';
import type { PlacedPin } from '../types/placed-pin.type.js';
import type { ScriptDetails } from '../types/script-details.type.js';
import type { ScriptOrderBody } from '../types/script-order-body.type.js';
import type { ScriptStop } from '../types/script-stop.type.js';

export function buildOrderBody(input: OrderInput): ScriptOrderBody {
  const { request, client, apiKey, trip } = input;
  return {
    channel: SCRIPT_CHANNEL,
    op: SCRIPT_OP.ORDER,
    apiKey,
    clientRef: request.external_reference,
    pickup: toStop(trip.pickup, request.restaurant_address),
    drop: toStop(trip.dropoff, request.receiver_address),
    size: SIZE_LABEL[request.size],
    when: request.pickup_time.when,
    whenAt: request.pickup_time.whenAt,
    handover: { type: HANDOVER_OTHER, name: request.restaurant_name, phone: request.restaurant_phone ?? client.dispatchPhone },
    receiver: { name: request.receiver_name, phone: request.receiver_phone },
    customer: { name: client.name, phone: client.dispatchPhone },
    details: toDetails(request),
    route: trip.route,
  };
}

function toStop(pin: PlacedPin, name: string): ScriptStop {
  return { lat: pin.lat, lng: pin.lng, name, note: NO_NOTE };
}

function toDetails(request: BookingRequest): ScriptDetails {
  return {
    item: request.item_type,
    weight: NO_WEIGHT,
    fragile: false,
    payer: PAYER_LABEL[request.payer],
    payMethod: PAY_METHOD_LABEL[request.pay_method],
    notes: orderNotes(request),
  };
}

function orderNotes(request: BookingRequest): string {
  const reference = NOTES_REFERENCE_PREFIX + request.external_reference;
  return request.notes ? reference + NOTES_SEPARATOR + request.notes : reference;
}
