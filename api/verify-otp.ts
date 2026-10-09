import type { Req, Res } from './_lib/middleware.js'
import { timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { json, methodGuard, parseBody } from './_lib/middleware.js'
import { checkRateLimit, rateLimitKey } from './_lib/rateLimit.js'
import { verifyOtpSchema } from './_lib/schemas.js'

/** Constant-time string comparison — prevents timing attacks on OTP values. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/** POST /api/verify-otp — check OTP and issue a 7-day session cookie */
export default async function handler(
  req: Req,
  res: Res,
): Promise<void> {
  if (!methodGuard(req, res, ['POST'])) return

  let body: unknown
  try {
    body = await parseBody(req)
  } catch {
    json(res, 400, { error: 'Invalid request body.' })
    return
  }

  const parsed = verifyOtpSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input.'
    json(res, 400, { error: message })
    return
  }

  const { token, otp } = parsed.data

  const secret = process.env.JWT_SECRET
  if (!secret) {
    json(res, 500, { error: 'Server configuration error.' })
    return
  }

  // Verify the OTP token (also checks expiry)
  let payload: { email: string; otp: string }
  try {
    payload = jwt.verify(token, secret) as { email: string; otp: string }
  } catch {
    json(res, 401, { error: 'Code expired. Request a new one.' })
    return
  }

  // Rate limit: max 5 verify attempts per email per 10 minutes
  const rl = checkRateLimit(
    rateLimitKey('verify-otp', payload.email),
    5,
    10 * 60 * 1000,
  )
  if (!rl.allowed) {
    const retryAfterSec = Math.ceil(rl.retryAfterMs / 1000)
    res.setHeader('Retry-After', String(retryAfterSec))
    json(res, 429, {
      error: `Too many attempts. Try again in ${retryAfterSec} seconds.`,
    })
    return
  }

  // Constant-time comparison — prevents timing-based OTP enumeration
  if (!safeEqual(otp, payload.otp)) {
    json(res, 401, { error: 'Incorrect code. Try again.' })
    return
  }

  // Issue 7-day session JWT stored in a secure httpOnly cookie
  const session = jwt.sign({ email: payload.email }, secret, { expiresIn: '7d' })
  const isProd = process.env.VERCEL_ENV === 'production'
  const maxAge = 7 * 24 * 3600
  const secure = isProd ? '; Secure' : ''

  res.setHeader('Set-Cookie', [
    `session=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`,
    `logged_in=1; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`,
  ])

  json(res, 200, { email: payload.email })
}
