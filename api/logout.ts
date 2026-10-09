import type { Req, Res } from './_lib/middleware.js'
import { json } from './_lib/middleware.js'

/** POST /api/logout — clear session and logged_in cookies */
export default function handler(
  _req: Req,
  res: Res,
): void {
  res.setHeader('Set-Cookie', [
    'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
    'logged_in=; SameSite=Strict; Path=/; Max-Age=0',
  ])
  json(res, 200, { ok: true })
}
