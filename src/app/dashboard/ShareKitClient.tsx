'use client'


import { useState, useEffect, useRef } from 'react'
import { toast }    from 'sonner'
import {
  Copy, Check, ExternalLink, AlertCircle,
  Share2, QrCode, Linkedin, Twitter,
  MessageSquare, Zap, Download,
} from 'lucide-react'
import { cn, formatINR, TALENT_TYPE_LABELS } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  slug:        string
  displayName: string
  talentType:  string
  headline:    string | null
  location:    string | null
  experience:  number | null
  tier1Label:  string | null; tier1Price: number | null
  tier2Label:  string | null; tier2Price: number | null
  isPublished: boolean
  skills:      string[]
}

interface Props { profile: Profile | null; userName: string }

// ─── Template builders ────────────────────────────────────────────────────────
function buildTemplates(p: Profile, url: string) {
  const name     = p.displayName
  const type     = TALENT_TYPE_LABELS[p.talentType]
  const loc      = p.location ?? ''
  const headline = p.headline ?? `${type} available for hire`
  const skills   = p.skills.slice(0, 3).join(', ')
  const price    = p.tier2Price ?? p.tier1Price
  const priceStr = price ? formatINR(price * 100) : null
  const starts   = priceStr ? `Starts at ${priceStr}.` : ''

  const whatsapp =
`Hi! I'm ${name} — ${type}${loc ? ` based in ${loc}` : ''}.

${headline}

${starts ? starts + '\n\n' : ''}See my rate card: ${url}`

  const oneliner =
`${name} | ${type}${loc ? ` · ${loc}` : ''}${priceStr ? ` · From ${priceStr}` : ''} · ${url}`

  const linkedin =
`${type}${loc ? ` · ${loc}` : ''}${p.experience ? ` · ${p.experience}y exp` : ''}

${headline}
${skills ? `\n${skills}` : ''}
${priceStr ? `\n💼 From ${priceStr}` : ''}
📋 ${url}`

  const twitterFull = `${type}${loc ? ` · ${loc}` : ''} · ${headline.slice(0, 60)}${priceStr ? ` · From ${priceStr}` : ''} · ${url}`
  const twitterMed  = `${type}${loc ? ` · ${loc}` : ''} · ${headline.slice(0, 40)} · ${url}`
  const twitterMin  = `${type} · ${url}`
  const twitter = twitterFull.length <= 160 ? twitterFull
    : twitterMed.length <= 160 ? twitterMed
    : twitterMin

  return { whatsapp, oneliner, linkedin, twitter }
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, label, size = 'md' }: {
  text: string; label: string; size?: 'sm' | 'md'
}) {
  const [copied, setCopied] = useState(false)
  async function handle() {
    try { await navigator.clipboard.writeText(text) }
    catch {
      const el = document.createElement('textarea')
      el.value = text; document.body.appendChild(el)
      el.select(); document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle} className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 flex-shrink-0',
      size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
      copied
        ? 'bg-success-50 text-success-700 border border-success-200'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent'
    )}>
      {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
    </button>
  )
}

// ─── QR Code (canvas, no external API) ───────────────────────────────────────
function QRCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function generate() {
      if (!canvasRef.current) return
      try {
        // Dynamically import qrcode so it doesn't affect SSR
        const QRCode = (await import('qrcode')).default
        await QRCode.toCanvas(canvasRef.current, url, {
          width:  200,
          margin: 2,
          color:  { dark: '#0f172a', light: '#ffffff' },
        })
        if (!cancelled) setReady(true)
      } catch (e) {
        console.error('QR generation failed:', e)
        if (!cancelled) setError(true)
      }
    }

    generate()
    return () => { cancelled = true }
  }, [url])

  function download() {
    if (!canvasRef.current) return
    try {
      const link = document.createElement('a')
      link.download = 'talrat-qr.png'
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
      toast.success('QR code downloaded!')
    } catch {
      toast.error('Download failed — try right-clicking the QR and saving')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-5">
      {/* Canvas */}
      <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className={cn(
            'block rounded transition-opacity duration-300',
            'w-[100px] h-[100px]', // display size (canvas is 200px for retina)
            ready ? 'opacity-100' : 'opacity-0'
          )}
        />
        {!ready && !error && (
          <div className="absolute inset-2.5 w-[100px] h-[100px] bg-slate-100 rounded animate-pulse" />
        )}
        {error && (
          <div className="w-[100px] h-[100px] bg-slate-50 rounded flex items-center justify-center">
            <p className="text-[10px] text-slate-400 text-center px-2">QR unavailable</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
            <QrCode className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-900">QR Code</p>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Business cards, pitch decks, email signature, WhatsApp status
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={download}
            disabled={!ready}
            className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3 h-3" />
            Download PNG
          </button>
          <CopyButton text={url} label="Profile URL" size="sm" />
        </div>
      </div>
    </div>
  )
}

// ─── Channel card ─────────────────────────────────────────────────────────────
function ChannelCard({
  id, icon: Icon, iconBg, label, sublabel, badge,
  content, charLimit, active, onToggle,
}: {
  id: string; icon: React.ElementType; iconBg: string
  label: string; sublabel: string; badge?: string
  content: string; charLimit?: number
  active: boolean; onToggle: () => void
}) {
  const chars = content.length
  const over  = charLimit ? chars > charLimit : false

  return (
    <div className={cn(
      'rounded-2xl border bg-white overflow-hidden transition-all duration-200',
      active
        ? 'border-brand-300 shadow-sm ring-1 ring-brand-100'
        : 'border-slate-200 hover:border-slate-300'
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            {badge && (
              <span className="text-[10px] font-semibold bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full border border-brand-100">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {charLimit && (
            <span className={cn(
              'text-[10px] font-mono px-1.5 py-0.5 rounded font-medium',
              over
                ? 'bg-danger-50 text-danger-600'
                : chars > charLimit * 0.85
                ? 'bg-warning-50 text-warning-600'
                : 'text-slate-400'
            )}>
              {chars}/{charLimit}
            </span>
          )}
          <CopyButton text={content} label={label} size="sm" />
        </div>
      </button>

      {active && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed break-words">
            {content}
          </pre>
          {over && (
            <p className="mt-3 text-xs text-danger-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {chars - charLimit!} chars over limit — shorten your headline or location
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <CopyButton text={content} label={label} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Profile URL bar ──────────────────────────────────────────────────────────
function UrlBar({ url, isPublished }: { url: string; isPublished: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-2xl">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-0.5">
          Your profile
        </p>
        <p className="text-sm text-white font-mono truncate">{url}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide',
          isPublished ? 'bg-success-500 text-white' : 'bg-slate-700 text-slate-400'
        )}>
          {isPublished ? 'Live' : 'Draft'}
        </span>
        <a
          href={url} target="_blank" rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <CopyButton text={url} label="Profile URL" size="sm" />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ShareKitClient({ profile }: Props) {
  const [open, setOpen] = useState<string | null>('whatsapp')
  const [appUrl, setAppUrl] = useState('https://talrat.com')

  // Get the actual origin client-side to avoid SSR mismatch
  useEffect(() => {
    setAppUrl(window.location.origin)
  }, [])

  if (!profile) {
    return (
      <div className="animate-fade-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-display">Share Kit</h1>
          <p className="text-slate-500 text-sm mt-1">4 ready-to-copy channel templates</p>
        </div>
        <div className="card p-10 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-2">Build your profile first</h2>
          <p className="text-sm text-slate-500 mb-5">Create and publish your rate card to unlock share templates.</p>
          <a href="/dashboard/profile" className="btn-primary text-sm inline-flex">Build my profile →</a>
        </div>
      </div>
    )
  }

  const url       = `${appUrl}/${profile.slug}`
  const templates = buildTemplates(profile, url)
  const firstName = profile.displayName.split(' ')[0]

  const channels = [
    {
      id: 'whatsapp', icon: MessageSquare, iconBg: 'bg-[#25d366]',
      label: 'WhatsApp', sublabel: 'Send to warm contacts and past clients',
      badge: 'Most sent', content: templates.whatsapp,
    },
    {
      id: 'oneliner', icon: Zap, iconBg: 'bg-warning-500',
      label: 'One-liner', sublabel: 'Slack, Discord, forums, email footers',
      content: templates.oneliner,
    },
    {
      id: 'linkedin', icon: Linkedin, iconBg: 'bg-[#0a66c2]',
      label: 'LinkedIn bio', sublabel: 'Paste into your LinkedIn About section',
      content: templates.linkedin, charLimit: 2600,
    },
    {
      id: 'twitter', icon: Twitter, iconBg: 'bg-black',
      label: 'Twitter / X bio', sublabel: 'Fits within the 160 character limit',
      content: templates.twitter, charLimit: 160,
    },
  ]

  return (
    <div className="animate-fade-up max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Share Kit</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ready-to-copy templates for {firstName}'s profile
        </p>
      </div>

      <UrlBar url={url} isPublished={profile.isPublished} />

      {!profile.isPublished && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Profile not published yet</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Publish first so the links in these templates work.{' '}
              <a href="/dashboard/profile" className="underline font-medium">Go to builder →</a>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {channels.map(ch => (
          <ChannelCard
            key={ch.id}
            {...ch}
            active={open === ch.id}
            onToggle={() => setOpen(p => p === ch.id ? null : ch.id)}
          />
        ))}
      </div>

      {/* QR — generated locally, no external API */}
      <QRCanvas url={url} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Where to use each
        </p>
        <div className="space-y-3">
          {[
            { ch: 'WhatsApp',        tip: 'Send to past clients, warm leads, contacts. Paste into your WhatsApp status for passive reach.' },
            { ch: 'One-liner',       tip: 'Slack community intros, Discord bio, Reddit posts, email signature, anywhere needing brevity.' },
            { ch: 'LinkedIn bio',    tip: 'Edit Profile → About section. Every recruiter and client who visits your profile sees this.' },
            { ch: 'Twitter / X bio', tip: 'Settings → Your Account → Bio. Turns every profile visit into a potential client.' },
            { ch: 'QR code',         tip: 'Business cards, pitch decks, conference badges, WhatsApp status image.' },
          ].map(({ ch, tip }) => (
            <div key={ch} className="flex gap-3 text-xs">
              <span className="text-slate-900 font-semibold w-28 flex-shrink-0 leading-relaxed">{ch}</span>
              <span className="text-slate-500 leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
