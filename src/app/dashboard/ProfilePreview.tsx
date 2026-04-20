'use client'


import { cn, formatINR, TALENT_TYPE_EMOJIS, TALENT_TYPE_LABELS  } from '@/lib/utils'
import {
  Globe, Linkedin, Twitter, Github, Instagram,
  ExternalLink, MapPin, Briefcase, Star, CheckCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PreviewData {
  talentType:   string
  displayName:  string
  slug:         string
  headline:     string
  bio:          string
  location:     string
  experience:   string
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'

  tier1Label:   string; tier1Price: string; tier1Desc: string
  tier2Label:   string; tier2Price: string; tier2Desc: string; tier2Popular: boolean
  tier3Label:   string; tier3Price: string; tier3Desc: string

  skills:       string[]
  workSamples:  { title: string; url: string }[]

  websiteUrl:   string; linkedinUrl:  string; twitterUrl:   string
  githubUrl:    string; instagramUrl: string; dribbbleUrl:  string; behanceUrl: string
}

// ─── Availability pill ────────────────────────────────────────────────────────
function AvailabilityBadge({ status }: { status: string }) {
  const map = {
    AVAILABLE:   { label: 'Available for work',   cls: 'bg-success-50 text-success-700 border-success-200' },
    BUSY:        { label: 'Limited availability', cls: 'bg-warning-50 text-warning-700 border-warning-200' },
    UNAVAILABLE: { label: 'Not available',        cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  }
  const { label, cls } = map[status as keyof typeof map] ?? map.AVAILABLE
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', cls)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

// ─── Rate card tier ───────────────────────────────────────────────────────────
function RateTier({
  label, price, desc, popular, highlight,
}: {
  label: string; price: string; desc: string
  popular: boolean; highlight?: boolean
}) {
  if (!label && !price) return null
  const priceNum = price ? parseFloat(price) * 100 : 0
  return (
    <div className={cn(
      'relative rounded-xl p-4 border transition-all',
      highlight
        ? 'border-brand-200 bg-brand-50 shadow-sm'
        : 'border-slate-200 bg-white'
    )}>
      {popular && highlight && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Most requested
          </span>
        </div>
      )}
      <p className={cn(
        'text-xs font-semibold mb-2',
        highlight ? 'text-brand-700' : 'text-slate-600'
      )}>
        {label || '—'}
      </p>
      <p className={cn(
        'text-xl font-bold font-display mb-1',
        highlight ? 'text-brand-800' : 'text-slate-900'
      )}>
        {priceNum > 0 ? formatINR(priceNum) : '₹—'}
      </p>
      {desc && (
        <p className="text-xs text-slate-500 leading-relaxed mt-1">{desc}</p>
      )}
    </div>
  )
}

// ─── Main preview component ───────────────────────────────────────────────────
export function ProfilePreview({ data }: { data: PreviewData }) {
  const hasName       = !!data.displayName
  const hasType       = !!data.talentType
  const hasRates      = !!(data.tier1Label || data.tier2Label || data.tier3Label)
  const hasSkills     = data.skills.length > 0
  const hasLinks      = !!(data.websiteUrl || data.linkedinUrl || data.twitterUrl ||
                           data.githubUrl  || data.instagramUrl)
  const hasSamples    = data.workSamples.filter(w => w.title && w.url).length > 0

  const socialLinks = [
    { url: data.websiteUrl,   icon: Globe,    label: 'Website'   },
    { url: data.linkedinUrl,  icon: Linkedin, label: 'LinkedIn'  },
    { url: data.twitterUrl,   icon: Twitter,  label: 'Twitter'   },
    { url: data.githubUrl,    icon: Github,   label: 'GitHub'    },
    { url: data.instagramUrl, icon: Instagram,label: 'Instagram' },
  ].filter(l => l.url)

  // Empty state
  if (!hasName && !hasType) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-400 mb-1">Preview appears here</p>
        <p className="text-xs text-slate-300">
          Select your talent type and fill in your details to see your profile come to life
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 text-sm">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">

        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold font-display flex-shrink-0">
            {data.displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 font-display truncate">
              {data.displayName || <span className="text-slate-300">Your Name</span>}
            </h1>
            {hasType && (
              <p className="text-xs text-brand-600 font-medium mt-0.5">
                {TALENT_TYPE_EMOJIS[data.talentType]}{TALENT_TYPE_LABELS[data.talentType]}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {data.location && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />{data.location}
                </span>
              )}
              {data.experience && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Briefcase className="w-3 h-3" />{data.experience}y exp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Availability + URL */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <AvailabilityBadge status={data.availability} />
          {data.slug && (
            <span className="text-[10px] text-slate-400 font-mono">
              talrat.com/{data.slug}
            </span>
          )}
        </div>

        {/* Headline */}
        {data.headline ? (
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            {data.headline}
          </p>
        ) : (
          <p className="text-sm text-slate-300 italic">Your one-line headline appears here</p>
        )}

        {/* Bio */}
        {data.bio && (
          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
            {data.bio}
          </p>
        )}

        {/* Social links */}
        {hasLinks && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {socialLinks.map(({ url, icon: Icon, label }) => (
              <span
                key={label}
                title={label}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Rate card ── */}
      {hasRates && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
            Engagement tiers
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <RateTier label={data.tier1Label} price={data.tier1Price} desc={data.tier1Desc} popular={false} />
            <RateTier label={data.tier2Label} price={data.tier2Price} desc={data.tier2Desc} popular={data.tier2Popular} highlight />
            <RateTier label={data.tier3Label} price={data.tier3Price} desc={data.tier3Desc} popular={false} />
          </div>

          {/* CTA button preview */}
          <button className="w-full mt-4 bg-brand-600 text-white text-xs font-semibold py-2.5 rounded-xl cursor-default">
            Contact {data.displayName?.split(' ')[0] || 'me'}
          </button>
        </div>
      )}

      {/* ── Skills ── */}
      {hasSkills && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.slice(0, 12).map(s => (
              <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                {s}
              </span>
            ))}
            {data.skills.length > 12 && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs">
                +{data.skills.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Work samples ── */}
      {hasSamples && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
            Work samples
          </h2>
          <div className="space-y-2">
            {data.workSamples
              .filter(w => w.title && w.url)
              .slice(0, 3)
              .map((w, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-3 h-3 text-brand-600" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium truncate flex-1">{w.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Powered by talrat ── */}
      <div className="text-center pt-1">
        <span className="text-[10px] text-slate-300">
          Powered by <span className="font-semibold text-slate-400">talrat.com</span>
        </span>
      </div>
    </div>
  )
}
