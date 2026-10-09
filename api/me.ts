import type { Req, Res } from './_lib/middleware.js'
import jwt from 'jsonwebtoken'
import { json, parseCookie } from './_lib/middleware.js'

/** GET /api/me — return the signed-in user's email, or 401 */
export default function handler(
  req: Req,
  res: Res,
): void {
  const sessionToken = parseCookie(req.headers.cookie ?? '', 'session')

  if (!sessionToken) {
    json(res, 401, { error: 'Not authenticated.' })
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    json(res, 500, { error: 'Server configuration error.' })
    return
  }

  try {
    const payload = jwt.verify(sessionToken, secret) as { email: string }
    json(res, 200, { email: payload.email })
  } catch {
    json(res, 401, { error: 'Session expired. Sign in again.' })
  }
}
