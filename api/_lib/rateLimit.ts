/**
 * In-memory rate limiter for Vercel serverless functions.
 *
 * Works per warm instance. On cold starts the counter resets, which is
 * acceptable for a stateless edge deployment — it prevents burst abuse
 * within a single instance lifetime without requiring external storage.
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

/**
 * Check and record a rate-limit hit.
 *
 * @param key        Unique key (e.g. "send-otp:user@example.com")
 * @param max        Maximum allowed attempts within the window
 * @param windowMs   Rolling window in milliseconds
 * @returns `{ allowed, retryAfterMs }` — retryAfterMs is 0 when allowed
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()

  // Evict expired entries on every call to prevent unbounded growth
  for (const [k, v] of store) {
    if (v.resetAt < now) store.delete(k)
  }

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count += 1
  return { allowed: true, retryAfterMs: 0 }
}

/** Normalise an identifier so "A@B.com" and "a@b.com" share the same bucket. */
export function rateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier.toLowerCase()}`
}
