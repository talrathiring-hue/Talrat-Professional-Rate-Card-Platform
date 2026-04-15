'use client'
import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

// ─── Google SVG icon ─────────────────────────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 font-medium px-1">or continue with email</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

// ─── Email sent success screen ────────────────────────────────────────────────
function EmailSentScreen({
  email,
  onReset,
}: {
  email: string
  onReset: () => void
}) {
  return (
    <div className="text-center py-6 animate-fade-in">
      <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-success-600" strokeWidth={1.5} />
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mb-2 font-display">
        Check your inbox
      </h2>

      <p className="text-sm text-slate-500 mb-1">We sent a magic link to</p>
      <p className="text-sm font-semibold text-slate-900 mb-5">{email}</p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left space-y-2">
        <p className="text-xs font-medium text-slate-600">What to do next:</p>
        {[
          'Open the email from talrat',
          'Click the "Sign in" button',
          'You will be logged in automatically',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-xs text-slate-500">{step}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Link expires in 10 minutes · Check spam if not received
      </p>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Use a different email
      </button>
    </div>
  )
}

// ─── Main login page ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailPending, startEmailTransition] = useTransition()

  // ── Google OAuth ────────────────────────────────────────────────────────────
  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError('Could not connect to Google. Please try again.')
      setGoogleLoading(false)
    }
  }

  // ── Magic link ──────────────────────────────────────────────────────────────
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setError('')

    startEmailTransition(async () => {
      try {
        const result = await signIn('resend', {
          email: trimmed,
          redirect: false,
          callbackUrl: '/dashboard',
        })

        if (result?.error) {
          setError(
            result.error === 'EmailSignin'
              ? 'Could not send email. Check your address and try again.'
              : 'Something went wrong. Please try again.'
          )
        } else {
          setEmailSent(true)
        }
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  const isLoading = googleLoading || emailPending

  return (
    <>
      {/* ── Heading ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 font-display mb-1">
          Welcome back
        </h1>
        <p className="text-slate-500 text-sm">
          Sign in to your talrat account
        </p>
      </div>

      {/* ── Card ── */}
      <div className="card p-7">
        {emailSent ? (
          <EmailSentScreen
            email={email}
            onReset={() => { setEmailSent(false); setEmail('') }}
          />
        ) : (
          <>
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>

            <Divider />

            {/* Magic link form */}
            <form onSubmit={handleEmail} noValidate>
              <div className="mb-4">
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="you@example.com"
                    className="input pl-10"
                    disabled={isLoading}
                    required
                    autoComplete="email"
                    autoFocus
                    aria-describedby={error ? 'email-error' : undefined}
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  id="email-error"
                  role="alert"
                  className="flex items-start gap-2 text-xs text-danger-600 bg-danger-50 border border-danger-100 px-3 py-2.5 rounded-lg mb-4"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="btn-primary w-full justify-center"
              >
                {emailPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    Send magic link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-5">
              No password needed — we email you a one-click sign-in link.
            </p>
          </>
        )}
      </div>

      {/* ── Footer link ── */}
      <p className="text-center text-sm text-slate-500 mt-6">
        New to talrat?{' '}
        <Link
          href="/auth/register"
          className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
        >
          Create your rate card →
        </Link>
      </p>
    </>
  )
}
