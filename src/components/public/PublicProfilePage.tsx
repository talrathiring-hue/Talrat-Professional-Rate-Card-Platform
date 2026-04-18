'use client'
// src/components/public/PublicProfilePage.tsx
// The full public profile page — what companies see at talrat.com/slug
// Design: clean, professional, LinkedIn-inspired but distinctly talrat
// Features: hero, rate card, skills, work samples, social links, contact form

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  MapPin, Briefcase, Globe, ExternalLink,
  MessageSquare, Linkedin, Twitter, Github,
  Instagram, Youtube, Dribbble, CheckCircle2,
  Loader2, ChevronRight, Star, Eye,
} from 'lucide-react'
import { cn, formatINR, TALENT_TYPE_LABELS, TALENT_TYPE_EMOJIS } from '@/lib/utils'

// ─── Profile type ─────────────────────────────────────────────────────────────
interface Profile {
  id: string; slug: string; talentType: string; displayName: string
  headline: string | null; bio: string | null; location: string | null
  experience: number | null; availability: string; avatarUrl: string | null
  tier1Label: string | null; tier1Price: number | null; tier1Desc: string | null
  tier2Label: string | null; tier2Price: number | null; tier2Desc: string | null; tier2Popular: boolean
  tier3Label: string | null; tier3Price: number | null; tier3Desc: string | null
  websiteUrl: string | null; linkedinUrl: string | null; twitterUrl: string | null
  githubUrl: string | null; instagramUrl: string | null; youtubeUrl: string | null
  dribbbleUrl: string | null; behanceUrl: string | null
  skills: string[]; workSamples: { title: string; url: string; description?: string | null }[]
  totalViews: number; totalLeads: number
}

interface Props { profile: Profile }

// ─── Availability pill ────────────────────────────────────────────────────────
function AvailabilityPill({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; pill: string }> = {
    AVAILABLE:   { label: 'Available for work',   dot: 'bg-success-500 animate-pulse', pill: 'bg-success-50 text-success-700 border-success-200' },
    BUSY:        { label: 'Limited availability', dot: 'bg-warning-500',               pill: 'bg-warning-50 text-warning-700 border-warning-200'  },
    UNAVAILABLE: { label: 'Not available',        dot: 'bg-slate-300',                 pill: 'bg-slate-100 text-slate-500 border-slate-200'        },
  }
  const { label, dot, pill } = map[status] ?? map.AVAILABLE
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border', pill)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {label}
    </span>
  )
}

// ─── Social link ──────────────────────────────────────────────────────────────
function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      title={label}
      className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all text-sm font-medium"
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  )
}

// ─── Rate tier card ───────────────────────────────────────────────────────────
function TierCard({
  label, price, desc, popular, onContact,
}: {
  label: string | null; price: number | null; desc: string | null
  popular: boolean; onContact: () => void
}) {
  if (!label) return null
  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl border p-6 transition-all duration-200',
      popular
        ? 'border-brand-300 bg-white shadow-brand ring-1 ring-brand-100 scale-[1.02]'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-card-hover'
    )}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-brand">
            <Star className="w-2.5 h-2.5 fill-current" />
            Most requested
          </span>
        </div>
      )}

      <div className="flex-1">
        <p className={cn(
          'text-xs font-bold uppercase tracking-widest mb-3',
          popular ? 'text-brand-600' : 'text-slate-400'
        )}>
          {label}
        </p>
        <p className={cn(
          'text-3xl font-bold font-display mb-1',
          popular ? 'text-brand-800' : 'text-slate-900'
        )}>
          {price ? formatINR(price * 100) : '—'}
        </p>
        {desc && (
          <p className="text-sm text-slate-500 leading-relaxed mt-3">{desc}</p>
        )}
      </div>

      <button
        onClick={onContact}
        className={cn(
          'mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
          popular
            ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-brand'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        )}
      >
        Get started
      </button>
    </div>
  )
}

// ─── Contact form ─────────────────────────────────────────────────────────────
function ContactForm({ profile, onClose }: { profile: Profile; onClose?: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const [pending, startTrans] = useTransition()

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in your name, email, and message')
      return
    }
    setError('')

    startTrans(async () => {
      try {
        const res = await fetch('/api/contact', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...form, profileSlug: profile.slug }),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error ?? 'Failed to send')
        setSent(true)
      } catch (e: any) {
        setError(e.message ?? 'Something went wrong. Please try again.')
      }
    })
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-success-600" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-display mb-2">Message sent!</h3>
        <p className="text-sm text-slate-500 mb-1">
          {profile.displayName.split(' ')[0]} will be notified right away.
        </p>
        <p className="text-xs text-slate-400">
          They typically respond within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Your name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Rohit Jain" required />
        </div>
        <div>
          <label className="label">Work email *</label>
          <input className="input" type="email" value={form.email}
            onChange={e => set('email', e.target.value)} placeholder="example@company.com" required />
        </div>
      </div>
      <div>
        <label className="label">Company</label>
        <input className="input" value={form.company} onChange={e => set('company', e.target.value)}
          placeholder="Your company name" />
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea className="textarea" rows={4} value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder={"Hi " + profile.displayName.split(' ')[0] + ", I'm looking for help with..."}
          required maxLength={1000} />
        <p className="text-xs text-slate-400 mt-1 text-right">{form.message.length}/1000</p>
      </div>

      {error && (
        <div className="text-xs text-danger-600 bg-danger-50 border border-danger-100 px-3 py-2.5 rounded-lg">
          {error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending
          ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
          : <>Send message <ChevronRight className="w-4 h-4" /></>
        }
      </button>

      <p className="text-xs text-slate-400 text-center">
        {profile.displayName.split(' ')[0]} gets a WhatsApp notification instantly
      </p>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function PublicProfilePage({ profile }: Props) {
  const [contactOpen, setContactOpen] = useState(false)
  const firstName = profile.displayName.split(' ')[0]

  // Track profile view
  useEffect(() => {
    fetch('/api/analytics', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ profileSlug: profile.slug, event: 'PROFILE_VIEW' }),
    }).catch(() => {})
  }, [profile.slug])

  const socialLinks = [
    { url: profile.websiteUrl,   icon: Globe,     label: 'Website'   },
    { url: profile.linkedinUrl,  icon: Linkedin,  label: 'LinkedIn'  },
    { url: profile.twitterUrl,   icon: Twitter,   label: 'Twitter'   },
    { url: profile.githubUrl,    icon: Github,    label: 'GitHub'    },
    { url: profile.instagramUrl, icon: Instagram, label: 'Instagram' },
    { url: profile.youtubeUrl,   icon: Youtube,   label: 'YouTube'   },
    { url: profile.dribbbleUrl,  icon: Dribbble,  label: 'Dribbble'  },
  ].filter(l => l.url)

  const hasTiers = !!(profile.tier1Label || profile.tier2Label || profile.tier3Label)
  const hasSkills = profile.skills.length > 0
  const hasSamples = profile.workSamples.length > 0

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top nav ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-600 font-display">
            Talrat
          </Link>
          <button
            onClick={() => setContactOpen(true)}
            className="btn-primary text-sm py-2"
          >
            Contact {firstName}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Left col: profile info ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Hero card ── */}
            <div className="card p-6 sm:p-8 animate-fade-up">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-card"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-3xl font-bold font-display ring-4 ring-white shadow-card">
                      {profile.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name + type */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display leading-tight">
                    {profile.displayName}
                  </h1>
                  <p className="text-brand-600 font-semibold mt-1 text-sm">
                    {TALENT_TYPE_EMOJIS[profile.talentType]}{' '}
                    {TALENT_TYPE_LABELS[profile.talentType]}
                  </p>

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {profile.location && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.location}
                      </span>
                    )}
                    {profile.experience && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Briefcase className="w-3.5 h-3.5" />
                        {profile.experience} years experience
                      </span>
                    )}
                    {profile.totalViews > 0 && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        {profile.totalViews} views
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <AvailabilityPill status={profile.availability} />
                  </div>
                </div>
              </div>

              {/* Headline */}
              {profile.headline && (
                <p className="text-base text-slate-800 font-medium mt-6 leading-relaxed">
                  {profile.headline}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2 mt-6 flex-wrap">
                  {socialLinks.map(({ url, icon, label }) => (
                    <SocialLink key={label} href={url!} icon={icon} label={label} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Rate card ── */}
            {hasTiers && (
              <div className="animate-fade-up animation-delay-100">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Engagement tiers
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <TierCard
                    label={profile.tier1Label} price={profile.tier1Price}
                    desc={profile.tier1Desc} popular={false}
                    onContact={() => setContactOpen(true)}
                  />
                  <TierCard
                    label={profile.tier2Label} price={profile.tier2Price}
                    desc={profile.tier2Desc} popular={profile.tier2Popular}
                    onContact={() => setContactOpen(true)}
                  />
                  <TierCard
                    label={profile.tier3Label} price={profile.tier3Price}
                    desc={profile.tier3Desc} popular={false}
                    onContact={() => setContactOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* ── Skills ── */}
            {hasSkills && (
              <div className="card p-6 animate-fade-up animation-delay-200">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Skills & expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Work samples ── */}
            {hasSamples && (
              <div className="card p-6 animate-fade-up animation-delay-300">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Work samples
                </h2>
                <div className="space-y-3">
                  {profile.workSamples.map((sample, i) => (
                    <a
                      key={i}
                      href={sample.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                        <ExternalLink className="w-4 h-4 text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-700 transition-colors">
                          {sample.title}
                        </p>
                        {sample.description && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{sample.description}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right col: contact card (sticky) ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 lg:sticky lg:top-24 animate-fade-up animation-delay-100">
              <h2 className="text-base font-bold text-slate-900 font-display mb-1">
                Work with {firstName}
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Send a message and {firstName} will get a WhatsApp notification instantly.
              </p>
              <ContactForm profile={profile} />
            </div>

            {/* Powered by */}
            <div className="text-center mt-4">
              <a
                href="/"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Rate card powered by{' '}
                <span className="font-semibold text-brand-600">talrat.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile contact overlay ── */}
      {contactOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-end sm:items-center justify-center p-4 lg:hidden animate-fade-in"
          onClick={e => e.target === e.currentTarget && setContactOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-modal animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 font-display">
                Contact {firstName}
              </h2>
              <button
                onClick={() => setContactOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <ContactForm profile={profile} onClose={() => setContactOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
