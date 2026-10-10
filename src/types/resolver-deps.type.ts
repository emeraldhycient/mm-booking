import type { AppDeps } from './app-deps.type.js';

export type ResolverDeps = Pick<AppDeps, 'scriptClient' | 'now'>;
