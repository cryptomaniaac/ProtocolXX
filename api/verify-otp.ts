import type { IncomingMessage, ServerResponse } from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'

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

// Constant-time string comparison — prevents timing attacks on OTP
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return timingSafeEqual(bufA, bufB)
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

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

  const { token, otp } = body
  if (
    typeof token !== 'string' ||
    typeof otp !== 'string' ||
    !/^\d{6}$/.test(otp.trim())
  ) {
    res.writeHead(400)
    res.end(JSON.stringify({ error: 'Invalid request.' }))
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'Server configuration error.' }))
    return
  }

  // Verify OTP token
  let payload: { email: string; otp: string }
  try {
    payload = jwt.verify(token, secret) as { email: string; otp: string }
  } catch {
    res.writeHead(401)
    res.end(JSON.stringify({ error: 'Code expired. Request a new one.' }))
    return
  }

  // Constant-time OTP comparison
  if (!safeEqual(otp.trim(), payload.otp)) {
    res.writeHead(401)
    res.end(JSON.stringify({ error: 'Incorrect code. Try again.' }))
    return
  }

  // Issue session JWT (7 days)
  const session = jwt.sign({ email: payload.email }, secret, { expiresIn: '7d' })
  const isProd = process.env.VERCEL_ENV === 'production'
  const maxAge = 7 * 24 * 3600
  const secure = isProd ? '; Secure' : ''

  res.setHeader('Set-Cookie', [
    `session=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`,
    `logged_in=1; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`,
  ])

  res.writeHead(200)
  res.end(JSON.stringify({ email: payload.email }))
}
