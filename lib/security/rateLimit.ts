export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

/**
 * In-process rate limiter. Works correctly within a single warm instance,
 * but is NOT a safe production rate limit on Vercel: serverless functions
 * are stateless across invocations, and a burst of traffic can be routed to
 * several different instances (each with its own memory), so this can
 * undercount real usage. It's the functional default so the app works
 * out of the box, but production deployments should replace it - see the
 * factory function below.
 */
class InMemoryRateLimiter implements RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || entry.resetAt <= now) {
      const resetAt = now + windowMs;
      this.hits.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  }
}

let limiter: RateLimiter | null = null;

/**
 * Returns the active rate limiter. Today this always returns the in-memory
 * implementation. To make rate limiting reliable in production on Vercel,
 * swap this for a persistent-store-backed implementation (see README notes
 * below) - the `RateLimiter` interface is the seam to implement against, so
 * no call sites need to change.
 *
 * Recommended production store: Vercel KV or Upstash Redis (Upstash's REST
 * API works from Vercel's serverless/edge runtimes without a persistent TCP
 * connection, which is why it's the common choice here). This is a paid
 * service beyond a small free tier, so it is intentionally NOT wired up
 * automatically. To enable it:
 *   1. Provision a Vercel KV or Upstash Redis instance.
 *   2. Install `@upstash/ratelimit` and `@upstash/redis` (or `@vercel/kv`).
 *   3. Set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (or the
 *      equivalent KV env vars) in Vercel's project settings.
 *   4. Implement `RateLimiter` using that client and return it from here
 *      when those env vars are present, falling back to
 *      `InMemoryRateLimiter` otherwise.
 */
export function getRateLimiter(): RateLimiter {
  if (!limiter) {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      console.warn(
        "[rateLimit] No persistent rate-limit store configured (UPSTASH_REDIS_REST_URL is unset). " +
          "Using an in-memory limiter, which does not reliably enforce limits across Vercel's " +
          "serverless instances. See lib/security/rateLimit.ts for how to configure a real store."
      );
    }
    limiter = new InMemoryRateLimiter();
  }
  return limiter;
}

export const RATE_LIMITS = {
  transcribe: { limit: 30, windowMs: 15 * 60 * 1000 },
  analyze: { limit: 30, windowMs: 15 * 60 * 1000 },
  compare: { limit: 20, windowMs: 15 * 60 * 1000 },
  factCheck: { limit: 20, windowMs: 15 * 60 * 1000 },
  extractSource: { limit: 15, windowMs: 15 * 60 * 1000 },
} as const;
