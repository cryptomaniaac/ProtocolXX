import type { IncomingMessage, ServerResponse } from 'node:http'
import { randomInt } from 'node:crypto'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

// Safe email regex — no nested quantifiers, no backtracking risk
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]{1,64}@[a-zA-Z0-9.\-]{1,253}\.[a-zA-Z]{2,}$/

function getBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => {
      data += chunk.toString()
      if (data.length > 4096) reject(new Error('Payload too large'))
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405)
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  let body: Record<string, unknown>
  try {
    body = await getBody(req)
  } catch {
    res.writeHead(400)
    res.end(JSON.stringify({ error: 'Invalid request body' }))
    return
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || !EMAIL_RE.test(email)) {
    res.writeHead(400)
    res.end(JSON.stringify({ error: 'Enter a valid email address.' }))
    return
  }

  const secret = process.env.JWT_SECRET
  const smtpPass = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL ?? 'onboarding@resend.dev'

  if (!secret || !smtpPass) {
    console.error('Missing env: JWT_SECRET or RESEND_API_KEY')
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'Server configuration error.' }))
    return
  }

  // 6-digit OTP using cryptographically secure random
  const otp = String(randomInt(100000, 1000000))

  // Sign OTP + email into a JWT — stateless, no DB needed
  const token = jwt.sign({ email, otp }, secret, { expiresIn: '10m' })

  // Send via Resend SMTP
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
    console.error('Failed to send email:', err)
    res.writeHead(502)
    res.end(JSON.stringify({ error: 'Failed to send email. Try again.' }))
    return
  }

  res.writeHead(200)
  res.end(JSON.stringify({ token }))
}
