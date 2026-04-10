
import Link from 'next/link'

const TALENT_TYPES = [
  'UI/UX Designer', 'Fullstack Developer', 'Content Writer',
  'Product Manager', 'Data Scientist', 'Graphic Designer',
  'SEO Specialist', 'Mobile Developer', 'Copywriter',
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Set up in 5 minutes',
    desc: 'Choose your talent type, fill your rate card, publish. Your professional page is live instantly.',
  },
  {
    icon: '📲',
    title: 'WhatsApp alerts, instantly',
    desc: 'Get notified the second someone views your profile or fills your contact form. Never miss a lead.',
  },
  {
    icon: '📊',
    title: 'See who is looking',
    desc: 'Analytics dashboard shows profile views, lead sources, visitor locations, and monthly trends.',
  },
  {
    icon: '🔗',
    title: 'Share everywhere',
    desc: '6 ready-to-copy templates — LinkedIn bio, cold email, WhatsApp message, Twitter bio, and more.',
  },
  {
    icon: '💰',
    title: '3-tier rate card',
    desc: 'Show three engagement levels with pricing. Clients instantly know how to work with you.',
  },
  {
    icon: '🛡️',
    title: 'Rate limited & secure',
    desc: 'Spam protection on every form. Your contact details stay private. Only serious inquiries get through.',
  },
]

const PROFILES = [
  {
    name: 'Santhosh Prakash',
    type: 'UI/UX Designer',
    location: 'Bengaluru',
    tier1: '₹5,000',
    tier2: '₹25,000',
    tier3: '₹1,00,000',
    skills: ['Figma', 'Website Creations', 'Framer'],
    views: '247',
    available: true,
  },
  {
    name: 'Blesson Paul',
    type: 'Fullstack Developer',
    location: 'Hosur',
    tier1: '₹3,000',
    tier2: '₹15,000',
    tier3: '₹80,000',
    skills: ['Next.js', 'Node.js', 'PostgreSQL'],
    views: '89',
    available: false,
  },
  {
    name: 'Sathish',
    type: 'Content Writer',
    location: 'Chennai',
    tier1: '₹2,000',
    tier2: '₹10,000',
    tier3: '₹40,000',
    skills: ['SEO Writing', 'Copywriting', 'SaaS'],
    views: '134',
    available: true,
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="container-lg flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600 font-display">talrat</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-20 pb-24 bg-hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/40 to-transparent pointer-events-none" />
        <div className="container-md text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-xs font-medium text-brand-700 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            Free for 30 days — no credit card needed
          </div>

          <h1 className="text-display-xl font-display font-bold text-slate-900 mb-6 animate-fade-up leading-tight">
            Your professional
            <span className="text-brand-600 block">rate card.</span>
          </h1>

          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto animate-fade-up animation-delay-100 leading-relaxed">
            Create a stunning profile page with your rates. Share it everywhere.
            Get WhatsApp alerts when clients reach out. Close deals faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up animation-delay-200">
            <Link href="/auth/register" className="btn-primary text-base py-3 px-8">
              Create your rate card →
            </Link>
            <Link href="/priya-sharma" className="btn-secondary text-base py-3 px-8">
              See an example
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400 animate-fade-up animation-delay-300">
            talrat.com/yourname — live in 5 minutes
          </p>
        </div>
      </section>

      {/* ── Scrolling talent types ── */}
      <section className="py-5 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="flex gap-3 animate-[slideLeft_20s_linear_infinite] whitespace-nowrap">
          {[...TALENT_TYPES, ...TALENT_TYPES].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 font-medium flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Demo profiles ── */}
      <section className="section">
        <div className="container-lg">
          <div className="text-center mb-14">
            <h2 className="text-display-sm font-display font-bold text-slate-900 mb-3">
              Real profiles. Real rates.
            </h2>
            <p className="text-slate-500 text-lg">
              This is what your talrat page looks like to companies browsing for talent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROFILES.map((p) => (
              <div key={p.name} className="card-hover p-6 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="avatar w-12 h-12 text-lg flex-shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.type}</div>
                    <div className="text-xs text-slate-400 mt-0.5">📍 {p.location}</div>
                  </div>
                  <span className={`badge text-xs ${p.available ? 'badge-success' : 'badge-warning'}`}>
                    {p.available ? 'Available' : 'Busy'}
                  </span>
                </div>

                {/* Rate card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Quick call</span>
                    <span className="font-semibold text-slate-900">{p.tier1}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-brand-50 px-3 py-2 rounded-lg border border-brand-100">
                    <span className="text-brand-700 font-medium">Sprint week</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-full">Popular</span>
                      <span className="font-bold text-brand-700">{p.tier2}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Full project</span>
                    <span className="font-semibold text-slate-900">{p.tier3}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <span key={s} className="badge badge-gray text-xs">{s}</span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{p.views} profile views</span>
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    Contact →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section bg-slate-50">
        <div className="container-lg">
          <div className="text-center mb-14">
            <h2 className="text-display-sm font-display font-bold text-slate-900 mb-3">
              Everything a freelancer needs
            </h2>
            <p className="text-slate-500 text-lg">Built specifically for Indian talent.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="section">
        <div className="container-md">
          <div className="text-center mb-14">
            <h2 className="text-display-sm font-display font-bold text-slate-900 mb-3">
              Simple pricing
            </h2>
            <p className="text-slate-500 text-lg">One plan. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free trial */}
            <div className="card p-8">
              <div className="text-sm font-semibold text-slate-500 mb-2">FREE TRIAL</div>
              <div className="text-4xl font-bold text-slate-900 mb-1">₹0</div>
              <div className="text-sm text-slate-400 mb-6">for 30 days</div>
              <ul className="space-y-3 mb-8">
                {['Public profile page', 'Rate card with 3 tiers', 'Analytics dashboard', 'Share kit', 'Email notifications'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-success-600">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="btn-secondary w-full justify-center">
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-brand-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                Most popular
              </div>
              <div className="text-sm font-semibold text-brand-200 mb-2">PRO</div>
              <div className="text-4xl font-bold mb-1">₹499</div>
              <div className="text-sm text-brand-200 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                {['Everything in Free', 'WhatsApp notifications', 'Lead management', 'Priority support', 'Profile badge'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <span className="text-brand-200">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="block w-full text-center bg-white text-brand-600 font-semibold py-2.5 rounded-lg hover:bg-brand-50 transition-colors">
                Get PRO →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section bg-slate-900">
        <div className="container-md text-center">
          <h2 className="text-display-sm font-display font-bold text-white mb-4">
            Your rate card is missing.<br />Let us fix that.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join Indian freelancers who close deals faster with talrat.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors text-base">
            Create your profile — it is free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-slate-100">
        <div className="container-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-brand-600 font-display">talrat.com</span>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/about" className="hover:text-slate-600">About</Link>
            <Link href="/blog" className="hover:text-slate-600">Blog</Link>
            <a href="mailto:hello@talrat.com" className="hover:text-slate-600">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
