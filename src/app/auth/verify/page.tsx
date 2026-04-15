
import Link from 'next/link'
import { Mail, ArrowLeft, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check your email',
}

export default function VerifyPage() {
  return (
    <>
      <div className="text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-brand-600" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 font-display mb-2">
          Check your inbox
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          We sent you a magic sign-in link.<br />
          Click it to access your talrat account instantly.
        </p>

        {/* Steps card */}
        <div className="card p-6 text-left mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Next steps
          </p>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Open the email',
                desc: 'Look for an email from talrat in your inbox',
              },
              {
                step: '2',
                title: 'Click sign in',
                desc: 'Click the "Sign in to talrat" button in the email',
              },
              {
                step: '3',
                title: 'Build your rate card',
                desc: "You'll land on your dashboard, ready to go",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiry notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-8">
          <Clock className="w-3.5 h-3.5" />
          Link expires in 10 minutes · Check your spam folder if not received
        </div>

        {/* Back link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </>
  )
}
