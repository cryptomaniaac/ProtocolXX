import { useState, useRef, useCallback } from 'react'
import type { AuthUser } from '../../lib/auth'

interface Props {
  onLogin: (user: AuthUser) => void
}

type Stage = 'email' | 'otp' | 'sending' | 'verifying'

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]{1,64}@[a-zA-Z0-9.\-]{1,253}\.[a-zA-Z]{2,}$/

export function LoginScreen({ onLogin }: Props) {
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const otpRef = useRef<HTMLInputElement>(null)

  const sendOtp = useCallback(async () => {
    setError(null)
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address.')
      emailRef.current?.focus()
      return
    }

    setStage('sending')
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = (await res.json()) as { token?: string; error?: string }
      if (!res.ok || !data.token) {
        setError(data.error ?? 'Failed to send code. Try again.')
        setStage('email')
        return
      }
      setToken(data.token)
      setStage('otp')
      setTimeout(() => otpRef.current?.focus(), 50)
    } catch {
      setError('Network error. Check your connection.')
      setStage('email')
    }
  }, [email])

  const verifyOtp = useCallback(async () => {
    setError(null)
    const trimmed = otp.trim()
    if (!/^\d{6}$/.test(trimmed)) {
      setError('Enter the 6-digit code from your inbox.')
      otpRef.current?.focus()
      return
    }

    setStage('verifying')
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp: trimmed }),
      })
      const data = (await res.json()) as { email?: string; error?: string }
      if (!res.ok || !data.email) {
        setError(data.error ?? 'Verification failed. Try again.')
        setStage('otp')
        return
      }
      onLogin({ email: data.email })
    } catch {
      setError('Network error. Check your connection.')
      setStage('otp')
    }
  }, [otp, token, onLogin])

  const isEmailStage = stage === 'email' || stage === 'sending'
  const isOtpStage = stage === 'otp' || stage === 'verifying'
  const isBusy = stage === 'sending' || stage === 'verifying'

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      data-testid="login-screen"
    >
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <p className="text-ink-muted text-sm mb-8">Unread Catchup</p>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-ink mb-2 leading-tight">
          {isEmailStage ? 'Sign in' : 'Check your inbox'}
        </h1>
        <p className="text-ink-muted text-base mb-8">
          {isEmailStage
            ? 'We will send a 6-digit code to your email.'
            : `We sent a code to ${email}. It expires in 10 minutes.`}
        </p>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {isEmailStage && (
            <>
              <label
                htmlFor="login-email"
                className="block text-sm text-ink-muted"
              >
                Email address
              </label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                autoComplete="email"
                autoFocus
                disabled={isBusy}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                placeholder="you@example.com"
                className="w-full h-11 px-3 rounded-lg border border-border bg-bg text-ink text-base placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                data-testid="email-input"
              />
            </>
          )}

          {isOtpStage && (
            <>
              <label
                htmlFor="login-otp"
                className="block text-sm text-ink-muted"
              >
                6-digit code
              </label>
              <input
                id="login-otp"
                ref={otpRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                disabled={isBusy}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                placeholder="000000"
                className="w-full h-11 px-3 rounded-lg border border-border bg-bg text-ink text-base tracking-[0.3em] placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                data-testid="otp-input"
              />
            </>
          )}

          {/* Error */}
          {error && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-sm text-high-fg"
              data-testid="login-error"
            >
              {error}
            </p>
          )}

          {/* Primary action */}
          {isEmailStage && (
            <button
              type="button"
              onClick={sendOtp}
              disabled={isBusy}
              className="w-full h-11 rounded-lg bg-accent text-on-accent text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card"
              data-testid="send-code-btn"
            >
              {isBusy ? 'Sending…' : 'Send code'}
            </button>
          )}

          {isOtpStage && (
            <button
              type="button"
              onClick={verifyOtp}
              disabled={isBusy}
              className="w-full h-11 rounded-lg bg-accent text-on-accent text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card"
              data-testid="verify-btn"
            >
              {isBusy ? 'Verifying…' : 'Verify code'}
            </button>
          )}

          {/* Back link */}
          {isOtpStage && (
            <button
              type="button"
              onClick={() => {
                setStage('email')
                setOtp('')
                setError(null)
              }}
              disabled={isBusy}
              className="w-full text-sm text-ink-muted hover:text-ink transition-colors text-center disabled:opacity-50"
            >
              Use a different email
            </button>
          )}
        </div>

        {/* Privacy note */}
        <p className="mt-4 text-xs text-ink-faint text-center">
          Your email is used only to verify your identity and is never stored
          beyond your session.
        </p>
      </div>
    </main>
  )
}

export default LoginScreen
