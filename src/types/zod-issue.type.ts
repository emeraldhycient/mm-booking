import type { z } from 'zod';

export type ZodIssue = z.ZodError['issues'][number];
