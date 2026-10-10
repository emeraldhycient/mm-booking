import type { ApiClient } from '../../types/api-client.type.js';
import type { RecordedRow } from '../../types/recorded-row.type.js';
import type { RoadRoute } from '../../types/road-route.type.js';
import type { ScriptOrderReply } from '../../types/script-order-reply.type.js';
import type { ScriptQuoteReply } from '../../types/script-quote-reply.type.js';
import type { ScriptResolveReply } from '../../types/script-resolve-reply.type.js';

export const DOSTEON: ApiClient = { id: 'CL-001', name: 'Dosteon', dispatchPhone: '0780000009' };
export const ROAD_7_26_KM: RoadRoute = { km: 7.2601, mins: 14 };
export const RESOLVED_LINK: ScriptResolveReply = { ok: true, lat: -1.95, lng: 30.06 };

// Served figures: live order MM-0510-W02 was 7.26 km and 2018 RWF on the current Rates tab.
export const QUOTE_7_26_KM: ScriptQuoteReply = {
  ok: true,
  inArea: true,
  km: 7.26,
  mins: 14,
  source: 'osrm',
  fee: 2018,
  base: 600,
  lines: [
    { label: '5 km × 200 (0–5 km)', amount: 1000 },
    { label: '2.26 km × 185 (5–10 km)', amount: 418 },
  ],
};

export const RECORDED_ROW: RecordedRow = {
  'Order ID': 'MM-1010-A01', Date: '10/10/2026', 'Customer / Business': 'Dosteon', 'Customer Phone': '780000009',
  Type: 'B2B', Leg: '1 of 1', 'Pickup Area': 'KG 550 Street, Kicukiro', 'Pickup Pin': '338M+8X Kigali',
  'Pickup Phone': '780000003', 'Requested Pickup': '2026-10-10 16:30', 'Drop Area': 'KG 108 Street, Remera',
  'Drop Pin': '34CM+6P Kigali', 'Drop Phone': '780000004', Item: 'Food', 'Distance km': '7.26', 'Fare RWF': '2018',
  'Paid By': 'Sender', 'Pay Method': 'Account', Status: 'New', Notes: 'Ref DOS-10422 · Ring at the gate',
  'Pickup Contact': 'Test Restaurant', 'Drop Contact': 'Test Receiver', 'Pickup Landmark': '', 'Drop Landmark': '',
  Size: 'Small', Weight: '', Fragile: '', 'Est. Minutes': '14', 'Distance Source': 'osrm',
  'Pickup Map': 'https://maps.google.com/?q=-1.93422,30.084892', 'Drop Map': 'https://maps.google.com/?q=-1.929434,30.134337',
  'Pickup Lat,Lng': '-1.93422,30.084892', 'Drop Lat,Lng': '-1.929434,30.134337', 'Created At': '2026-10-10 14:00:00',
  Source: 'API · Dosteon',
};

export const ORDER_REPLY_NEW: ScriptOrderReply = {
  ok: true,
  duplicate: false,
  orderId: 'MM-1010-A01',
  fee: 2018,
  km: 7.26,
  mins: 14,
  base: 600,
  lines: QUOTE_7_26_KM.lines,
  row: RECORDED_ROW,
};

export const ORDER_REPLY_REPEAT: ScriptOrderReply = {
  ok: true,
  duplicate: true,
  orderId: 'MM-1010-A01',
  fee: 2018,
  km: 7.26,
  mins: 14,
  row: RECORDED_ROW,
};
