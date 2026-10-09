import type { IncomingMessage, ServerResponse } from 'node:http'
import jwt from 'jsonwebtoken'

function parseCookie(header: string, name: string): string | null {
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? match[1] : null
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  const cookieHeader = req.headers.cookie ?? ''
  const sessionToken = parseCookie(cookieHeader, 'session')

  if (!sessionToken) {
    res.writeHead(401)
    res.end(JSON.stringify({ error: 'Not authenticated' }))
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'Server configuration error.' }))
    return
  }

  try {
    const payload = jwt.verify(sessionToken, secret) as { email: string }
    res.writeHead(200)
    res.end(JSON.stringify({ email: payload.email }))
  } catch {
    res.writeHead(401)
    res.end(JSON.stringify({ error: 'Session expired. Sign in again.' }))
  }
}
