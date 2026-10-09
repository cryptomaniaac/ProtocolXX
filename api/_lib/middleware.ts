/**
 * Minimal structural types compatible with Node.js IncomingMessage/ServerResponse.
 * Defined inline so this file works under both browser and Node.js tscconfigs
 * without requiring @types/node in the frontend compilation.
 */

export interface Req {
  method?: string
  headers: Record<string, string | string[] | undefined>
  on(event: 'data', listener: (chunk: { toString(): string }) => void): void
  on(event: 'end', listener: () => void): void
  on(event: 'error', listener: (err: Error) => void): void
}

export interface Res {
  setHeader(name: string, value: string | string[]): void
  writeHead(statusCode: number): void
  end(data?: string): void
}

/** Send a JSON response with the given HTTP status code. */
export function json(res: Res, status: number, body: unknown): void {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(status)
  res.end(JSON.stringify(body))
}

/**
 * Guard a handler to only accept the listed HTTP methods.
 * Returns `false` (and writes a 405 response) if the method is not allowed.
 */
export function methodGuard(req: Req, res: Res, allowed: string[]): boolean {
  if (!allowed.includes(req.method ?? '')) {
    res.setHeader('Allow', allowed.join(', '))
    json(res, 405, { error: 'Method not allowed.' })
    return false
  }
  return true
}

/**
 * Read and parse the request body as JSON.
 * Rejects if the body exceeds 8 KB or is not valid JSON.
 */
export function parseBody(req: Req): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk.toString()
      if (raw.length > 8192) reject(new Error('Payload too large.'))
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON.'))
      }
    })
    req.on('error', reject)
  })
}

/**
 * Parse the `Cookie` header and return the value for `name`, or null.
 * Uses simple indexOf — no regex backtracking risk.
 */
export function parseCookie(header: string, name: string): string | null {
  const start = header.indexOf(`${name}=`)
  if (start === -1) return null
  const valueStart = start + name.length + 1
  const end = header.indexOf(';', valueStart)
  return end === -1 ? header.slice(valueStart) : header.slice(valueStart, end)
}
