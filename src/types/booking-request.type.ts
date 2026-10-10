import type { z } from 'zod';
import type { createBookingRequestSchema } from '../validation/booking-request.schema.js';

export type BookingRequest = z.infer<ReturnType<typeof createBookingRequestSchema>>;
