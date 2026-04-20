'use client'
// src/components/dashboard/ProfileBuilderClient.tsx
// Updated Day 8 — adds live preview panel + completeness score
// Layout: wizard on left, preview panel on right (desktop)
// Mobile: preview toggle button shows/hides preview

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  ExternalLink, Globe, Sparkles, Eye, EyeOff,
} from 'lucide-react'
import { cn, generateSlug, formatINR } from '@/lib/utils'
import {
  TALENT_TYPES, CATEGORY_ORDER, getTalentTypesByCategory,
  type TalentTypeKey, type TalentTypeConfig,
} from '@/lib/talent-types'
import { ProfilePreview } from './ProfilePreview'
import { ProfileCompleteness } from './ProfileCompleteness'

// ─── Step bar ────────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'Type' },
  { n: 2, label: 'Info' },
  { n: 3, label: 'Rates' },
  { n: 4, label: 'Skills' },
  { n: 5, label: 'Publish' },
]

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
            current === s.n && 'bg-brand-600 text-white shadow-brand',
            current > s.n  && 'bg-success-50 text-success-700',
            current < s.n  && 'bg-slate-100 text-slate-400',
          )}>
            {current > s.n
              ? <Check className="w-3 h-3" />
              : <span className="w-3 h-3 flex items-center justify-center font-bold text-[10px]">{s.n}</span>
            }
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              'h-px w-4 sm:w-6 mx-1 transition-colors duration-200',
              current > s.n ? 'bg-success-300' : 'bg-slate-200'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Wizard data type ────────────────────────────────────────────────────────
export interface WizardData {
  talentType: TalentTypeKey | ''
  displayName: string; slug: string; headline: string; bio: string
  location: string; experience: string
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
  adaptiveData: Record<string, string | string[]>
  tier1Label: string; tier1Price: string; tier1Desc: string
  tier2Label: string; tier2Price: string; tier2Desc: string; tier2Popular: boolean
  tier3Label: string; tier3Price: string; tier3Desc: string
  skills: string[]; skillInput: string
  websiteUrl: string; linkedinUrl: string; twitterUrl: string
  githubUrl: string; instagramUrl: string; dribbbleUrl: string; behanceUrl: string
  workSamples: { title: string; url: string }[]
  isPublished: boolean
}

const DEFAULT_DATA: WizardData = {
  talentType: '', displayName: '', slug: '', headline: '', bio: '',
  location: '', experience: '', availability: 'AVAILABLE', adaptiveData: {},
  tier1Label: '', tier1Price: '', tier1Desc: '',
  tier2Label: '', tier2Price: '', tier2Desc: '', tier2Popular: true,
  tier3Label: '', tier3Price: '', tier3Desc: '',
  skills: [], skillInput: '',
  websiteUrl: '', linkedinUrl: '', twitterUrl: '',
  githubUrl: '', instagramUrl: '', dribbbleUrl: '', behanceUrl: '',
  workSamples: [], isPublished: false,
}

interface Props {
  existingProfile: any | null
  userId: string
  userName: string
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProfileBuilderClient({ existingProfile, userName }: Props) {
  const router = useRouter()
  const [step, setStep]               = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, startSaving]         = useTransition()
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug]   = useState(false)
  const isEditing = !!existingProfile

  const [data, setData] = useState<WizardData>(() => {
    if (!existingProfile) return { ...DEFAULT_DATA, displayName: userName }
    return {
      ...DEFAULT_DATA,
      talentType:   existingProfile.talentType ?? '',
      displayName:  existingProfile.displayName ?? userName,
      slug:         existingProfile.slug ?? '',
      headline:     existingProfile.headline ?? '',
      bio:          existingProfile.bio ?? '',
      location:     existingProfile.location ?? '',
      experience:   existingProfile.experience?.toString() ?? '',
      availability: existingProfile.availability ?? 'AVAILABLE',
      adaptiveData: existingProfile.adaptiveData ?? {},
      tier1Label:   existingProfile.tier1Label ?? '',
      tier1Price:   existingProfile.tier1Price ? String(Math.round(existingProfile.tier1Price / 100)) : '',
      tier1Desc:    existingProfile.tier1Desc ?? '',
      tier2Label:   existingProfile.tier2Label ?? '',
      tier2Price:   existingProfile.tier2Price ? String(Math.round(existingProfile.tier2Price / 100)) : '',
      tier2Desc:    existingProfile.tier2Desc ?? '',
      tier2Popular: existingProfile.tier2Popular ?? true,
      tier3Label:   existingProfile.tier3Label ?? '',
      tier3Price:   existingProfile.tier3Price ? String(Math.round(existingProfile.tier3Price / 100)) : '',
      tier3Desc:    existingProfile.tier3Desc ?? '',
      skills:       existingProfile.skills?.map((s: any) => s.name) ?? [],
      skillInput:   '',
      websiteUrl:   existingProfile.websiteUrl ?? '',
      linkedinUrl:  existingProfile.linkedinUrl ?? '',
      twitterUrl:   existingProfile.twitterUrl ?? '',
      githubUrl:    existingProfile.githubUrl ?? '',
      instagramUrl: existingProfile.instagramUrl ?? '',
      dribbbleUrl:  existingProfile.dribbbleUrl ?? '',
      behanceUrl:   existingProfile.behanceUrl ?? '',
      workSamples:  existingProfile.workSamples?.map((w: any) => ({ title: w.title, url: w.url })) ?? [],
      isPublished:  existingProfile.isPublished ?? false,
    }
  })

  function set(key: keyof WizardData, value: any) {
    setData(d => ({ ...d, [key]: value }))
  }

  // Auto-generate slug
  useEffect(() => {
    if (!isEditing && data.displayName && !data.slug) {
      set('slug', generateSlug(data.displayName))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.displayName])

  // Live slug check
  useEffect(() => {
    if (!data.slug) return
    setSlugAvailable(null)
    setCheckingSlug(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/slug?slug=${encodeURIComponent(data.slug)}`)
        const json = await res.json()
        setSlugAvailable(json.available)
      } catch { setSlugAvailable(null) }
      finally { setCheckingSlug(false) }
    }, 500)
    return () => clearTimeout(t)
  }, [data.slug])

  // Apply type defaults
  function applyTypeDefaults(key: TalentTypeKey) {
    const cfg = TALENT_TYPES[key]
    setData(d => ({
      ...d,
      talentType: key,
      tier1Label: cfg.rateCardDefaults.tier1Label,
      tier1Price: String(cfg.rateCardDefaults.tier1Price),
      tier1Desc:  cfg.rateCardDefaults.tier1Desc,
      tier2Label: cfg.rateCardDefaults.tier2Label,
      tier2Price: String(cfg.rateCardDefaults.tier2Price),
      tier2Desc:  cfg.rateCardDefaults.tier2Desc,
      tier3Label: cfg.rateCardDefaults.tier3Label,
      tier3Price: String(cfg.rateCardDefaults.tier3Price),
      tier3Desc:  cfg.rateCardDefaults.tier3Desc,
      skills:     d.skills.length ? d.skills : cfg.suggestedSkills.slice(0, 6),
      headline:   d.headline || cfg.headlineTemplates[0],
    }))
  }

  async function save(publish?: boolean) {
    const payload = {
      talentType: data.talentType, displayName: data.displayName, slug: data.slug,
      headline: data.headline, bio: data.bio, location: data.location,
      experience: data.experience ? parseInt(data.experience) : undefined,
      availability: data.availability, adaptiveData: data.adaptiveData,
      tier1Label: data.tier1Label, tier1Price: data.tier1Price ? parseFloat(data.tier1Price) : undefined, tier1Desc: data.tier1Desc,
      tier2Label: data.tier2Label, tier2Price: data.tier2Price ? parseFloat(data.tier2Price) : undefined, tier2Desc: data.tier2Desc, tier2Popular: data.tier2Popular,
      tier3Label: data.tier3Label, tier3Price: data.tier3Price ? parseFloat(data.tier3Price) : undefined, tier3Desc: data.tier3Desc,
      websiteUrl: data.websiteUrl, linkedinUrl: data.linkedinUrl, twitterUrl: data.twitterUrl,
      githubUrl: data.githubUrl, instagramUrl: data.instagramUrl, dribbbleUrl: data.dribbbleUrl, behanceUrl: data.behanceUrl,
      skills: data.skills.map(name => ({ name })),
      workSamples: data.workSamples,
      isPublished: publish ?? data.isPublished,
    }
    const res = await fetch('/api/profile', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error ?? 'Save failed')
    return result.profile
  }

  function goToStep(n: number) {
    if (n >= 1 && n <= 5) { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  function handleNext() {
    if (step === 1 && !data.talentType) { toast.error('Select your talent type'); return }
    if (step === 2 && !data.displayName) { toast.error('Enter your display name'); return }
    if (step === 2 && slugAvailable === false) { toast.error('That URL is taken — choose another'); return }
    goToStep(step + 1)
  }

  function handleBack() { goToStep(step - 1) }

  async function handleSaveDraft() {
    startSaving(async () => {
      try { await save(false); toast.success('Draft saved') }
      catch (e: any) { toast.error(e.message) }
    })
  }

  async function handlePublish() {
    startSaving(async () => {
      try {
        const profile = await save(true)
        toast.success('Profile is live! 🎉')
        router.push(`/${profile.slug}`)
      } catch (e: any) { toast.error(e.message) }
    })
  }

  const cfg = data.talentType ? TALENT_TYPES[data.talentType] : null

  // Preview data shape matches PreviewData type
  const previewData = {
    talentType: data.talentType, displayName: data.displayName, slug: data.slug,
    headline: data.headline, bio: data.bio, location: data.location,
    experience: data.experience, availability: data.availability,
    tier1Label: data.tier1Label, tier1Price: data.tier1Price, tier1Desc: data.tier1Desc,
    tier2Label: data.tier2Label, tier2Price: data.tier2Price, tier2Desc: data.tier2Desc, tier2Popular: data.tier2Popular,
    tier3Label: data.tier3Label, tier3Price: data.tier3Price, tier3Desc: data.tier3Desc,
    skills: data.skills, workSamples: data.workSamples,
    websiteUrl: data.websiteUrl, linkedinUrl: data.linkedinUrl, twitterUrl: data.twitterUrl,
    githubUrl: data.githubUrl, instagramUrl: data.instagramUrl,
    dribbbleUrl: data.dribbbleUrl, behanceUrl: data.behanceUrl,
  }

  return (
    <div className="animate-fade-up">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mb-1">
            {isEditing ? 'Edit your profile' : 'Build your rate card'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditing ? 'Keep your rate card up to date' : 'About 5 minutes. Edit anytime.'}
          </p>
        </div>
        {/* Mobile preview toggle */}
        <button
          onClick={() => setShowPreview(v => !v)}
          className="lg:hidden btn-secondary text-xs gap-1.5"
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? 'Hide' : 'Preview'}
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-8 items-start">

        {/* ── Left: wizard ── */}
        <div className={cn('flex-1 min-w-0', showPreview && 'hidden lg:block')}>

          {/* Step bar */}
          <div className="mb-6">
            <StepBar current={step} />
          </div>

          {/* Step card */}
          <div className="card p-6 sm:p-8">
            {step === 1 && (
              <Step1TypeSelector
                selected={data.talentType as TalentTypeKey}
                onSelect={key => { set('talentType', key); applyTypeDefaults(key) }}
              />
            )}
            {step === 2 && cfg && (
              <Step2BasicInfo
                data={data} set={set} cfg={cfg}
                slugAvailable={slugAvailable}
                checkingSlug={checkingSlug}
                isEditing={isEditing}
              />
            )}
            {step === 3 && <Step3RateCard data={data} set={set} />}
            {step === 4 && cfg && <Step4SkillsLinks data={data} set={set} cfg={cfg} />}
            {step === 5 && <Step5Review data={data} cfg={cfg} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <div>
              {step > 1 && (
                <button onClick={handleBack} className="btn-secondary">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step >= 2 && (
                <button onClick={handleSaveDraft} disabled={saving} className="btn-ghost text-sm">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save draft
                </button>
              )}
              {step < 5 ? (
                <button onClick={handleNext} className="btn-primary">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-success-600 text-white font-medium rounded-lg hover:bg-success-700 disabled:opacity-50 transition-colors"
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
                    : <><Sparkles className="w-4 h-4" />Publish profile</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: preview panel ── */}
        <div className={cn(
          'w-80 xl:w-96 flex-shrink-0 space-y-4',
          'hidden lg:block',
          showPreview && '!block fixed inset-0 z-50 bg-slate-50 overflow-auto p-4 lg:static lg:p-0 lg:bg-transparent'
        )}>
          {/* Mobile close button */}
          {showPreview && (
            <div className="lg:hidden flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-900">Live preview</p>
              <button onClick={() => setShowPreview(false)} className="btn-ghost text-sm">
                ← Back to editor
              </button>
            </div>
          )}

          {/* Completeness score */}
          <ProfileCompleteness data={previewData} onGoToStep={goToStep} />

          {/* Preview label */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Live preview
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Phone frame */}
          <div className="rounded-3xl border-2 border-slate-200 overflow-hidden bg-slate-50 shadow-card">
            {/* Phone header bar */}
            <div className="bg-white px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <div className="w-2 h-2 rounded-full bg-slate-200" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[9px] text-slate-400 font-mono">
                  talrat.com/{data.slug || '—'}
                </span>
              </div>
            </div>
            {/* Preview content */}
            <div className="max-h-[600px] overflow-y-auto">
              <ProfilePreview data={previewData} />
            </div>
          </div>

          {/* View full page link */}
          {isEditing && existingProfile?.slug && (
            <a
              href={`/${existingProfile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View full public profile
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
function Step1TypeSelector({ selected, onSelect }: {
  selected: TalentTypeKey | ''; onSelect: (k: TalentTypeKey) => void
}) {
  const grouped = getTalentTypesByCategory()
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 font-display mb-1">
          What best describes your work?
        </h2>
        <p className="text-sm text-slate-500">
          Shapes your profile layout and pre-fills rate card defaults.
        </p>
      </div>
      <div className="space-y-5">
        {CATEGORY_ORDER.map(cat => (
          <div key={cat}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{cat}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {grouped[cat].map(cfg => (
                <button
                  key={cfg.key}
                  onClick={() => onSelect(cfg.key)}
                  className={cn(
                    'flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-150',
                    selected === cfg.key
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <span className="text-xl leading-none mt-0.5 flex-shrink-0">{cfg.emoji}</span>
                  <div className="min-w-0">
                    <p className={cn('text-xs font-semibold leading-tight',
                      selected === cfg.key ? 'text-brand-700' : 'text-slate-800'
                    )}>{cfg.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-2">
                      {cfg.tagline}
                    </p>
                  </div>
                  {selected === cfg.key && (
                    <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
function Step2BasicInfo({ data, set, cfg, slugAvailable, checkingSlug, isEditing }: {
  data: WizardData; set: (k: keyof WizardData, v: any) => void
  cfg: TalentTypeConfig; slugAvailable: boolean | null
  checkingSlug: boolean; isEditing: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{cfg.emoji}</span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 font-display">{cfg.label}</h2>
          <p className="text-sm text-slate-500">{cfg.tagline}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="label">Your name *</label>
          <input className="input" value={data.displayName}
            onChange={e => set('displayName', e.target.value)} placeholder="Santhosh Prakash" autoFocus />
        </div>
        <div>
          <label className="label">Profile URL *</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 flex-shrink-0">talrat.com/</span>
            <div className="relative flex-1">
              <input
                className={cn('input pr-10',
                  slugAvailable === false && 'border-danger-400 focus:ring-danger-400'
                )}
                value={data.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="santhosh-prakash"
                disabled={isEditing}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingSlug && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />}
                {!checkingSlug && slugAvailable === true  && <Check className="w-3.5 h-3.5 text-success-500" />}
                {!checkingSlug && slugAvailable === false && <span className="text-[10px] text-danger-500 font-medium">taken</span>}
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="label">Headline</label>
          <input className="input" value={data.headline}
            onChange={e => set('headline', e.target.value)}
            placeholder={cfg.headlineTemplates[0]} maxLength={160} />
          <p className="text-xs text-slate-400 mt-1 text-right">{data.headline.length}/160</p>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="textarea" rows={3} value={data.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Tell clients who you are, who you work with, and what makes you different."
            maxLength={600} />
          <p className="text-xs text-slate-400 mt-1 text-right">{data.bio.length}/600</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={data.location}
              onChange={e => set('location', e.target.value)} placeholder="Bengaluru, India" />
          </div>
          <div>
            <label className="label">Years of experience</label>
            <input className="input" type="number" min="0" max="50"
              value={data.experience} onChange={e => set('experience', e.target.value)} placeholder="4" />
          </div>
        </div>
        <div>
          <label className="label">Availability</label>
          <div className="flex gap-2 flex-wrap">
            {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as const).map(a => (
              <button key={a} onClick={() => set('availability', a)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  data.availability === a
                    ? a === 'AVAILABLE' ? 'bg-success-50 border-success-300 text-success-700'
                      : a === 'BUSY'    ? 'bg-warning-50 border-warning-300 text-warning-700'
                      : 'bg-danger-50 border-danger-300 text-danger-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                )}>
                {a === 'AVAILABLE' ? '● Available' : a === 'BUSY' ? '◐ Busy' : '○ Unavailable'}
              </button>
            ))}
          </div>
        </div>
        {cfg.adaptiveFields.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {cfg.label} details
            </p>
            <div className="space-y-3">
              {cfg.adaptiveFields.map(field => (
                <AdaptiveField
                  key={field.key} field={field}
                  value={data.adaptiveData[field.key] ?? ''}
                  onChange={v => set('adaptiveData', { ...data.adaptiveData, [field.key]: v })}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AdaptiveField({ field, value, onChange }: { field: any; value: any; onChange: (v: any) => void }) {
  if (field.type === 'select') {
    return (
      <div>
        <label className="label">{field.label}{field.required && ' *'}</label>
        <select className="input bg-white" value={value} onChange={e => onChange(e.target.value)}>
          <option value="">Select...</option>
          {field.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }
  if (field.type === 'multiselect') {
    const arr: string[] = Array.isArray(value) ? value : []
    return (
      <div>
        <label className="label">{field.label}{field.required && ' *'}</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {field.options?.map((o: string) => (
            <button key={o} type="button"
              onClick={() => onChange(arr.includes(o) ? arr.filter((x: string) => x !== o) : [...arr, o])}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                arr.includes(o)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}>
              {o}
            </button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div>
      <label className="label">{field.label}{field.required && ' *'}</label>
      <input className="input"
        type={field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : 'text'}
        value={value} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
function Step3RateCard({ data, set }: { data: WizardData; set: (k: keyof WizardData, v: any) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 font-display mb-1">Your rate card</h2>
        <p className="text-sm text-slate-500">Pre-filled with typical rates for your talent type. Adjust to match yours.</p>
      </div>
      <div className="space-y-4">
        {([
          { n:1, lk:'tier1Label', pk:'tier1Price', dk:'tier1Desc', pop: null },
          { n:2, lk:'tier2Label', pk:'tier2Price', dk:'tier2Desc', pop: 'tier2Popular' },
          { n:3, lk:'tier3Label', pk:'tier3Price', dk:'tier3Desc', pop: null },
        ] as const).map(({ n, lk, pk, dk, pop }) => (
          <div key={n} className={cn(
            'p-5 rounded-xl border',
            n === 2 ? 'border-brand-200 bg-brand-50/40' : 'border-slate-200'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold',
                n === 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
              )}>{n}</div>
              <span className="text-sm font-semibold text-slate-800">
                Tier {n} {n === 2 && <span className="text-brand-600 text-xs">most popular</span>}
              </span>
              {pop && (
                <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={data.tier2Popular}
                    onChange={e => set('tier2Popular', e.target.checked)} />
                  &quot;Popular&quot; badge
                </label>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label text-xs">Label</label>
                <input className="input text-sm" value={(data as any)[lk]}
                  onChange={e => set(lk as keyof WizardData, e.target.value)}
                  placeholder={n === 1 ? 'Quick call' : n === 2 ? 'Sprint week' : 'Full project'} />
              </div>
              <div>
                <label className="label text-xs">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input className="input pl-7 text-sm" type="number" min="0"
                    value={(data as any)[pk]}
                    onChange={e => set(pk as keyof WizardData, e.target.value)} />
                </div>
                {(data as any)[pk] && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    = {formatINR(parseFloat((data as any)[pk]) * 100)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="label text-xs">Description</label>
              <input className="input text-sm" value={(data as any)[dk]}
                onChange={e => set(dk as keyof WizardData, e.target.value)}
                placeholder="What's included?" maxLength={200} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STEP 4 ───────────────────────────────────────────────────────────────────
function Step4SkillsLinks({ data, set, cfg }: {
  data: WizardData; set: (k: keyof WizardData, v: any) => void; cfg: TalentTypeConfig
}) {
  function addSkill() {
    const s = data.skillInput.trim()
    if (!s || data.skills.includes(s) || data.skills.length >= 20) return
    set('skills', [...data.skills, s]); set('skillInput', '')
  }
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Skills</h2>
        <p className="text-sm text-slate-500 mb-3">Up to 20 skills shown as tags on your profile.</p>
        {cfg.suggestedSkills.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-400 mb-2">Suggested:</p>
            <div className="flex flex-wrap gap-1.5">
              {cfg.suggestedSkills.map(s => (
                <button key={s} onClick={() => !data.skills.includes(s) && set('skills', [...data.skills, s])}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                    data.skills.includes(s)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  )}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {data.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {data.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                {s}
                <button onClick={() => set('skills', data.skills.filter(x => x !== s))}
                  className="text-slate-400 hover:text-danger-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input className="input flex-1 text-sm" value={data.skillInput}
            onChange={e => set('skillInput', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Type a skill + Enter" maxLength={30} />
          <button onClick={addSkill} className="btn-secondary text-sm px-4">Add</button>
        </div>
        <p className="text-xs text-slate-400 mt-1">{data.skills.length}/20</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-900">Work samples</h2>
          <span className="text-xs text-slate-400">{data.workSamples.length}/6</span>
        </div>
        <p className="text-sm text-slate-500 mb-3">Links to your best work.</p>
        {data.workSamples.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.workSamples.map((ws, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1 grid sm:grid-cols-2 gap-2">
                  <input className="input text-sm" placeholder="Title" value={ws.title}
                    onChange={e => { const a = [...data.workSamples]; a[i] = { ...a[i], title: e.target.value }; set('workSamples', a) }} />
                  <input className="input text-sm" placeholder="https://..." value={ws.url}
                    onChange={e => { const a = [...data.workSamples]; a[i] = { ...a[i], url: e.target.value }; set('workSamples', a) }} />
                </div>
                <button onClick={() => set('workSamples', data.workSamples.filter((_, j) => j !== i))}
                  className="text-slate-400 hover:text-danger-500 p-2 mt-0.5 transition-colors">×</button>
              </div>
            ))}
          </div>
        )}
        {data.workSamples.length < 6 && (
          <button onClick={() => set('workSamples', [...data.workSamples, { title: '', url: '' }])}
            className="btn-secondary text-sm">+ Add sample</button>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Social links</h2>
        <p className="text-sm text-slate-500 mb-3">Add the ones relevant to your work.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key:'websiteUrl',   label:'Website',   ph:'https://yoursite.com' },
            { key:'linkedinUrl',  label:'LinkedIn',  ph:'https://linkedin.com/in/...' },
            { key:'twitterUrl',   label:'Twitter/X', ph:'https://twitter.com/...' },
            { key:'githubUrl',    label:'GitHub',    ph:'https://github.com/...' },
            { key:'instagramUrl', label:'Instagram', ph:'https://instagram.com/...' },
            { key:'dribbbleUrl',  label:'Dribbble',  ph:'https://dribbble.com/...' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="label text-xs">{label}</label>
              <input className="input text-sm" type="url" placeholder={ph}
                value={(data as any)[key]}
                onChange={e => set(key as keyof WizardData, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── STEP 5 ───────────────────────────────────────────────────────────────────
function Step5Review({ data, cfg }: { data: WizardData; cfg: TalentTypeConfig | null }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 font-display mb-1">Ready to go live?</h2>
        <p className="text-sm text-slate-500">Your profile will be published at your talrat URL.</p>
      </div>
      <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl mb-6">
        <Globe className="w-4 h-4 text-slate-400" />
        <span className="text-white text-sm font-mono flex-1">
          talrat.com/<span className="text-brand-400">{data.slug}</span>
        </span>
        <a href={`/${data.slug}`} target="_blank" rel="noopener noreferrer"
          className="text-slate-400 hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="space-y-3 mb-6">
        {[
          ['Type',     `${cfg?.emoji} ${cfg?.label}`],
          ['Name',     data.displayName],
          ['Headline', data.headline],
          ['Location', data.location],
          ['Skills',   `${data.skills.length} skills added`],
          ['Tiers',    [data.tier1Label, data.tier2Label, data.tier3Label].filter(Boolean).join(' · ')],
        ].filter(([_, v]) => v).map(([label, value]) => (
          <div key={label as string} className="flex items-start gap-4">
            <span className="text-xs text-slate-400 w-20 flex-shrink-0 mt-0.5">{label}</span>
            <span className="text-sm text-slate-800">{value}</span>
          </div>
        ))}
      </div>
      <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
        <p className="text-sm font-semibold text-success-800 mb-2">When you publish</p>
        <ul className="text-xs text-success-700 space-y-1">
          <li>✓ Profile goes live at talrat.com/{data.slug}</li>
          <li>✓ Companies can find and contact you immediately</li>
          <li>✓ WhatsApp + email alerts for every lead</li>
          <li>✓ Analytics tracking starts right away</li>
        </ul>
      </div>
    </div>
  )
}
