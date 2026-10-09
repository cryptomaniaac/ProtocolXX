export interface AuthUser {
  email: string
}

/** Check session with server. Returns user or null. */
export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/me')
    if (!res.ok) return null
    return (await res.json()) as AuthUser
  } catch {
    return null
  }
}

/** Clear session on server and client. */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/logout', { method: 'POST' })
  } catch {
    // best-effort
  }
}
