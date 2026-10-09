import type { Req, Res } from './_lib/middleware.js'
import { json } from './_lib/middleware.js'

/** GET /api/health — liveness check for monitoring and CI */
export default function handler(
  _req: Req,
  res: Res,
): void {
  json(res, 200, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  })
}
