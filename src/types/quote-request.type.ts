import type { z } from 'zod';
import type { quoteRequestSchema } from '../validation/booking-request.schema.js';

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
