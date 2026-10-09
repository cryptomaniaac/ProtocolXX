import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, rateLimitKey } from '../../api/_lib/rateLimit'
import { sendOtpSchema, verifyOtpSchema } from '../../api/_lib/schemas'
import { parseCookie } from '../../api/_lib/middleware'

// ---------------------------------------------------------------------------
// Rate limiter
// ---------------------------------------------------------------------------

describe('checkRateLimit', () => {
  // Each test uses a unique key so the shared in-memory store doesn't bleed
  let key: string
  let id = 0

  beforeEach(() => {
    id++
    key = `test-${id}:user@example.com`
  })

  it('allows requests within the limit', () => {
    const r1 = checkRateLimit(key, 3, 60_000)
    const r2 = checkRateLimit(key, 3, 60_000)
    const r3 = checkRateLimit(key, 3, 60_000)
    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r3.allowed).toBe(true)
  })

  it('blocks requests that exceed the limit', () => {
    checkRateLimit(key, 3, 60_000)
    checkRateLimit(key, 3, 60_000)
    checkRateLimit(key, 3, 60_000)
    const blocked = checkRateLimit(key, 3, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
  })

  it('allows a single request when max is 1', () => {
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true)
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false)
  })

  it('resets after the window expires', async () => {
    // Use a 1ms window so it expires immediately
    checkRateLimit(key, 1, 1)
    checkRateLimit(key, 1, 1)
    await new Promise((r) => setTimeout(r, 5))
    const after = checkRateLimit(key, 1, 60_000)
    expect(after.allowed).toBe(true)
  })
})

describe('rateLimitKey', () => {
  it('normalises to lowercase', () => {
    expect(rateLimitKey('otp', 'USER@Example.COM')).toBe('otp:user@example.com')
  })

  it('includes the prefix', () => {
    expect(rateLimitKey('send-otp', 'a@b.com')).toBe('send-otp:a@b.com')
  })
})

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

describe('sendOtpSchema', () => {
  it('accepts a valid email and lowercases it', () => {
    const result = sendOtpSchema.safeParse({ email: 'User@Example.COM' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('user@example.com')
  })

  it('rejects a missing email', () => {
    expect(sendOtpSchema.safeParse({}).success).toBe(false)
  })

  it('rejects a malformed email', () => {
    expect(sendOtpSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects an email longer than 254 chars', () => {
    const long = 'a'.repeat(250) + '@b.com'
    expect(sendOtpSchema.safeParse({ email: long }).success).toBe(false)
  })
})

describe('verifyOtpSchema', () => {
  it('accepts a valid token + 6-digit OTP', () => {
    const result = verifyOtpSchema.safeParse({ token: 'tok', otp: '123456' })
    expect(result.success).toBe(true)
  })

  it('rejects a non-numeric OTP', () => {
    expect(verifyOtpSchema.safeParse({ token: 'tok', otp: 'abcdef' }).success).toBe(false)
  })

  it('rejects a short OTP', () => {
    expect(verifyOtpSchema.safeParse({ token: 'tok', otp: '12345' }).success).toBe(false)
  })

  it('rejects a long OTP', () => {
    expect(verifyOtpSchema.safeParse({ token: 'tok', otp: '1234567' }).success).toBe(false)
  })

  it('rejects a missing token', () => {
    expect(verifyOtpSchema.safeParse({ otp: '123456' }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Cookie parser
// ---------------------------------------------------------------------------

describe('parseCookie', () => {
  it('returns the cookie value when present', () => {
    expect(parseCookie('session=abc123; other=xyz', 'session')).toBe('abc123')
  })

  it('returns null when the cookie is absent', () => {
    expect(parseCookie('other=xyz', 'session')).toBeNull()
  })

  it('parses the last cookie in the header', () => {
    expect(parseCookie('a=1; b=2; c=3', 'c')).toBe('3')
  })

  it('returns null on an empty header', () => {
    expect(parseCookie('', 'session')).toBeNull()
  })
})
