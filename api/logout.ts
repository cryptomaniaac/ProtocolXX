import type { IncomingMessage, ServerResponse } from 'node:http'

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Set-Cookie', [
    'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
    'logged_in=; SameSite=Strict; Path=/; Max-Age=0',
  ])
  res.writeHead(200)
  res.end(JSON.stringify({ ok: true }))
}
