
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Sign in',
    template: '%s | talrat',
  },
}

const STATS = [
  { value: '2,400+', label: 'Talent profiles' },
  { value: '₹499', label: 'Per month after trial' },
  { value: '30 days', label: 'Free trial' },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col bg-slate-900 relative overflow-hidden flex-shrink-0">

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Blue accent glow top-right */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        {/* Blue accent glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-500 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col h-full p-12">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-2xl font-bold text-white font-display group-hover:text-brand-300 transition-colors">
              Talrat
            </span>
            <span className="text-slate-500 text-sm"></span>
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white font-display leading-tight mb-4">
              Your professional<br />
              <span className="text-brand-400">rate card.</span><br />
              Shared everywhere.
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              The simplest way for Indian freelancers to share their rates,
              get discovered, and close deals faster.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-lg font-bold text-white font-display">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-4">
                &quot;I got my first client enquiry within 2 days of creating my talrat profile.
                The WhatsApp notification hit while I was having chai.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                  P
                </div>
                <div>
                  <div className="text-white text-xs font-medium">Santhosh Prakash</div>
                  <div className="text-slate-500 text-xs">UI/UX Designer · Bengaluru</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/about" className="hover:text-slate-400 transition-colors">About</Link>
            <Link href="/blog" className="hover:text-slate-400 transition-colors">Blog</Link>
            <a href="mailto:hello@talrat.com" className="hover:text-slate-400 transition-colors">Support</a>
            <span className="ml-auto">Built in India 🇮🇳</span>
          </div>
        </div>
      </div>

      {/* ── Right panel — form (full width on mobile) ── */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-auto">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <Link href="/" className="text-xl font-bold text-brand-600 font-display">
            talrat
          </Link>
        </div>

        {/* Page content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md animate-fade-up">
            {children}
          </div>
        </div>

        {/* Bottom footer on mobile */}
        <div className="lg:hidden flex justify-center gap-4 px-6 py-4 text-xs text-slate-400">
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <a href="mailto:hello@talrat.com">Support</a>
        </div>
      </div>
    </div>
  )
}
