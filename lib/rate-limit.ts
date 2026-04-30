/**
 * lib/rate-limit.ts
 * Simple in-memory rate limiter for Prontuário Social API routes.
 * Works in both Edge and Node.js runtimes.
 * For production with real DB: swap to Redis/Upstash.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store — resets on cold start (acceptable for MVP)
const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit?: number
  /** Window duration in milliseconds */
  windowMs?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if a given key (e.g. IP + route) is within rate limit.
 * Returns { allowed, remaining, resetAt }.
 */
export function rateLimit(
  key: string,
  { limit = 30, windowMs = 60_000 }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  // Window expired or new key — reset
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    // Cleanup old entries periodically (every ~1000 entries)
    if (store.size > 1000) {
      for (const [k, v] of store.entries()) {
        if (v.resetAt < now) store.delete(k)
      }
    }
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Extract a best-effort IP from Next.js request headers.
 * Priority: x-forwarded-for → x-real-ip → fallback
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
