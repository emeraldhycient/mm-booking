import { ERROR_CODE } from '../constants/error.constant.js';
import { CACHEABLE_LOOKUP_ERRORS, CLIENT_CACHE_TTL_MS } from '../constants/limits.constant.js';
import { ApiError } from '../errors/api-error.js';
import { toScriptApiError } from '../script/script-error.js';
import type { ApiClient } from '../types/api-client.type.js';
import type { CacheEntry } from '../types/cache-entry.type.js';
import type { CachedClient } from '../types/cached-client.type.js';
import type { ClientOutcome } from '../types/client-outcome.type.js';
import type { ClientResolver } from '../types/client-resolver.type.js';
import type { ResolverContext } from '../types/resolver-context.type.js';
import type { ResolverDeps } from '../types/resolver-deps.type.js';
import type { ScriptClient } from '../types/script-client.type.js';

export function createClientResolver(deps: ResolverDeps): ClientResolver {
  const cache = new Map<string, CachedClient>();
  return {
    resolve(apiKey: string): Promise<ApiClient> {
      return resolveClient(apiKey, { cache, deps });
    },
  };
}

async function resolveClient(apiKey: string, ctx: ResolverContext): Promise<ApiClient> {
  const nowMs = ctx.deps.now().getTime();
  const cached = ctx.cache.get(apiKey);
  if (cached && cached.expiresAt > nowMs) return settle(cached.outcome);
  const outcome = await lookUp(apiKey, ctx.deps.scriptClient);
  if (isCacheable(outcome)) remember(ctx.cache, { apiKey, outcome, nowMs });
  return settle(outcome);
}

async function lookUp(apiKey: string, scriptClient: ScriptClient): Promise<ClientOutcome> {
  const reply = await scriptClient.lookupClient(apiKey);
  return reply.ok && reply.client ? { client: reply.client } : { error: toScriptApiError(reply.error) };
}

function isCacheable(outcome: ClientOutcome): boolean {
  const code = outcome.error?.code;
  return Boolean(outcome.client) || (code !== undefined && CACHEABLE_LOOKUP_ERRORS.includes(code));
}

function remember(cache: Map<string, CachedClient>, entry: CacheEntry): void {
  for (const [key, cached] of cache) if (cached.expiresAt <= entry.nowMs) cache.delete(key);
  cache.set(entry.apiKey, { outcome: entry.outcome, expiresAt: entry.nowMs + CLIENT_CACHE_TTL_MS });
}

function settle(outcome: ClientOutcome): ApiClient {
  if (outcome.client) return outcome.client;
  throw outcome.error ?? new ApiError(ERROR_CODE.INTERNAL);
}
