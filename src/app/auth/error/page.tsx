

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in error',
}

// NextAuth error codes → human readable messages
const ERROR_MESSAGES: Record<string, { title: string; desc: string; action: string }> = {
  Configuration: {
    title: 'Server configuration error',
    desc: 'There is a problem with the server configuration. Please contact support.',
    action: 'Contact support',
  },
  AccessDenied: {
    title: 'Access denied',
    desc: 'Your account has been suspended. Please contact support if you think this is a mistake.',
    action: 'Contact support',
  },
  Verification: {
    title: 'Link expired',
    desc: 'This magic link has expired or already been used. Magic links are valid for 10 minutes and can only be used once.',
    action: 'Get a new link',
  },
  OAuthSignin: {
    title: 'Google sign-in failed',
    desc: 'Could not start the Google sign-in process. Please try again.',
    action: 'Try again',
  },
  OAuthCallback: {
    title: 'Google sign-in failed',
    desc: 'Something went wrong during Google sign-in. Please try again.',
    action: 'Try again',
  },
  OAuthCreateAccount: {
    title: 'Account creation failed',
    desc: 'Could not create your account. Please try again or use a different sign-in method.',
    action: 'Try again',
  },
  EmailCreateAccount: {
    title: 'Account creation failed',
    desc: 'Could not create your account with this email. Please try again.',
    action: 'Try again',
  },
  Callback: {
    title: 'Sign-in failed',
    desc: 'Something went wrong during sign-in. Please try again.',
    action: 'Try again',
  },
  EmailSignin: {
    title: 'Email not sent',
    desc: 'Could not send the magic link email. Check your email address and try again.',
    action: 'Try again',
  },
  CredentialsSignin: {
    title: 'Invalid credentials',
    desc: 'The email or password you entered is incorrect.',
    action: 'Try again',
  },
  SessionRequired: {
    title: 'Sign in required',
    desc: 'You need to be signed in to access this page.',
    action: 'Sign in',
  },
  Default: {
    title: 'Something went wrong',
    desc: 'An unexpected error occurred during sign-in. Please try again.',
    action: 'Try again',
  },
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorCode = searchParams.error ?? 'Default'
  const errorInfo = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default
  const isExpired = errorCode === 'Verification'

  return (
    <>
      <div className="text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-danger-50 border border-danger-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-danger-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 font-display mb-2">
          {errorInfo.title}
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          {errorInfo.desc}
        </p>

        {/* Error code (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-slate-100 rounded-lg px-3 py-2 mb-6 inline-block">
            <code className="text-xs text-slate-500">error: {errorCode}</code>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="btn-primary justify-center"
          >
            {isExpired ? (
              <><RefreshCw className="w-4 h-4" /> Get a new magic link</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Try signing in again</>
            )}
          </Link>

          <Link
            href="/"
            className="btn-secondary justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to homepage
          </Link>
        </div>

        {/* Support */}
        <p className="text-xs text-slate-400 mt-8">
          Still having trouble?{' '}
          <a
            href="mailto:hello@talrat.com"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Contact support →
          </a>
        </p>
      </div>
    </>
  )
}
