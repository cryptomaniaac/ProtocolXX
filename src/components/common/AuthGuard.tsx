import { useState, useEffect } from 'react'
import { getMe, type AuthUser } from '../../lib/auth'
import LoginScreen from '../screens/LoginScreen'

interface Props {
  children: (user: AuthUser) => React.ReactNode
}

type CheckState = 'checking' | 'unauthenticated' | 'authenticated'

export function AuthGuard({ children }: Props) {
  const [state, setState] = useState<CheckState>('checking')
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    getMe().then((u) => {
      if (u) {
        setUser(u)
        setState('authenticated')
      } else {
        setState('unauthenticated')
      }
    })
  }, [])

  if (state === 'checking') {
    // Same layout shell as the real screen — no layout shift
    return (
      <div
        className="flex-1 flex items-center justify-center"
        aria-live="polite"
        aria-label="Checking session"
        data-testid="auth-checking"
      >
        <p className="text-ink-muted text-sm">Checking session…</p>
      </div>
    )
  }

  if (state === 'unauthenticated') {
    return (
      <LoginScreen
        onLogin={(u) => {
          setUser(u)
          setState('authenticated')
        }}
      />
    )
  }

  return <>{children(user!)}</>
}

export default AuthGuard
