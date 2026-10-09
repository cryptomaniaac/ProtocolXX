import type { Req, Res } from './_lib/middleware.js'
import { randomInt } from 'node:crypto'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { json, methodGuard, parseBody } from './_lib/middleware.js'
import { checkRateLimit, rateLimitKey } from './_lib/rateLimit.js'
import { sendOtpSchema } from './_lib/schemas.js'

/** POST /api/send-otp — generate and email a 6-digit OTP */
export default async function handler(
  req: Req,
  res: Res,
): Promise<void> {
  if (!methodGuard(req, res, ['POST'])) return

  // Parse and validate body with Zod
  let body: unknown
  try {
    body = await parseBody(req)
  } catch {
    json(res, 400, { error: 'Invalid request body.' })
    return
  }

  const parsed = sendOtpSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input.'
    json(res, 400, { error: message })
    return
  }

  const { email } = parsed.data

  // Rate limit: max 3 OTP requests per email per 10 minutes
  const rl = checkRateLimit(rateLimitKey('send-otp', email), 3, 10 * 60 * 1000)
  if (!rl.allowed) {
    const retryAfterSec = Math.ceil(rl.retryAfterMs / 1000)
    res.setHeader('Retry-After', String(retryAfterSec))
    json(res, 429, {
      error: `Too many requests. Try again in ${retryAfterSec} seconds.`,
    })
    return
  }

  const secret = process.env.JWT_SECRET
  const smtpPass = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL ?? 'onboarding@resend.dev'

  if (!secret || !smtpPass) {
    console.error('[send-otp] Missing env: JWT_SECRET or RESEND_API_KEY')
    json(res, 500, { error: 'Server configuration error.' })
    return
  }

  // Cryptographically secure 6-digit OTP
  const otp = String(randomInt(100000, 1000000))

  // Sign OTP + email into a short-lived JWT — stateless, no DB needed
  const token = jwt.sign({ email, otp }, secret, { expiresIn: '10m' })

  const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: { user: 'resend', pass: smtpPass },
  })

  try {
    await transporter.sendMail({
      from: `Unread Catchup <${fromEmail}>`,
      to: email,
      subject: 'Your login code',
      text: [
        `Your Unread Catchup login code is: ${otp}`,
        '',
        'This code expires in 10 minutes.',
        'If you did not request this, ignore this email.',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[send-otp] SMTP error:', err)
    json(res, 502, { error: 'Failed to send email. Try again.' })
    return
  }

  json(res, 200, { token })
}
