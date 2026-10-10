import type { CachedClient } from './cached-client.type.js';
import type { ResolverDeps } from './resolver-deps.type.js';

export interface ResolverContext {
  cache: Map<string, CachedClient>;
  deps: ResolverDeps;
}
