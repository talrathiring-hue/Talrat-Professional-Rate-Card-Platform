'use client'


import { cn } from '@/lib/utils'
import { CheckCircle, Circle, ChevronRight } from 'lucide-react'
import type { PreviewData } from './ProfilePreview'

// ─── Scoring rules ────────────────────────────────────────────────────────────
interface ScoreItem {
  key:      string
  label:    string
  points:   number
  done:     (d: PreviewData) => boolean
  tip:      string
  step:     number  // which wizard step has this field
}

const SCORE_ITEMS: ScoreItem[] = [
  {
    key: 'type',   label: 'Talent type selected',   points: 10,
    done: d => !!d.talentType,
    tip: 'Select your talent type in Step 1',        step: 1,
  },
  {
    key: 'name',   label: 'Display name',            points: 10,
    done: d => d.displayName.length >= 2,
    tip: 'Add your name in Step 2',                  step: 2,
  },
  {
    key: 'headline', label: 'Headline',              points: 10,
    done: d => d.headline.length >= 10,
    tip: 'Write a one-line headline in Step 2',       step: 2,
  },
  {
    key: 'bio',    label: 'Bio written',             points: 15,
    done: d => d.bio.length >= 50,
    tip: 'Write at least 50 characters of bio',      step: 2,
  },
  {
    key: 'location', label: 'Location set',          points: 5,
    done: d => d.location.length > 0,
    tip: 'Add your city in Step 2',                  step: 2,
  },
  {
    key: 'rates',  label: 'Rate card complete',      points: 15,
    done: d => !!(d.tier1Price && d.tier2Price && d.tier3Price),
    tip: 'Set all 3 tier prices in Step 3',          step: 3,
  },
  {
    key: 'tier-labels', label: 'Tier labels filled', points: 5,
    done: d => !!(d.tier1Label && d.tier2Label && d.tier3Label),
    tip: 'Add labels for all 3 tiers in Step 3',     step: 3,
  },
  {
    key: 'skills', label: 'Skills added (5+)',       points: 10,
    done: d => d.skills.length >= 5,
    tip: 'Add at least 5 skills in Step 4',          step: 4,
  },
  {
    key: 'linkedin', label: 'LinkedIn linked',       points: 5,
    done: d => d.linkedinUrl.length > 0,
    tip: 'Add your LinkedIn URL in Step 4',          step: 4,
  },
  {
    key: 'social',  label: 'Another social link',    points: 5,
    done: d => !!(d.websiteUrl || d.twitterUrl || d.githubUrl || d.instagramUrl),
    tip: 'Add a website or social link in Step 4',   step: 4,
  },
  {
    key: 'samples', label: 'Work sample added',      points: 10,
    done: d => d.workSamples?.some(w => w.title && w.url),
    tip: 'Add at least one work sample in Step 4',   step: 4,
  },
]

// Fix the closure issue in the work samples check
const SCORE_ITEMS_FIXED: ScoreItem[] = SCORE_ITEMS.map(item =>
  item.key === 'samples'
    ? { ...item, done: (d: PreviewData) => d.workSamples.some(w => w.title && w.url) }
    : item
)

// ─── Score calculation ─────────────────────────────────────────────────────
export function calculateCompleteness(data: PreviewData): {
  score:    number
  maxScore: number
  pct:      number
  done:     ScoreItem[]
  missing:  ScoreItem[]
  label:    string
  color:    string
} {
  const done:    ScoreItem[] = []
  const missing: ScoreItem[] = []
  let score = 0
  const maxScore = SCORE_ITEMS_FIXED.reduce((s, i) => s + i.points, 0)

  SCORE_ITEMS_FIXED.forEach(item => {
    if (item.done(data)) { done.push(item); score += item.points }
    else { missing.push(item) }
  })

  const pct = Math.round((score / maxScore) * 100)
  const label = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 40 ? 'Getting there' : 'Just started'
  const color = pct >= 90 ? 'bg-success-500' : pct >= 70 ? 'bg-brand-600' : pct >= 40 ? 'bg-warning-500' : 'bg-slate-300'

  return { score, maxScore, pct, done, missing, label, color }
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  data:       PreviewData
  onGoToStep: (step: number) => void
}

export function ProfileCompleteness({ data, onGoToStep }: Props) {
  const { pct, done, missing, label, color } = calculateCompleteness(data)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card">

      {/* Score header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">Profile strength</p>
          <p className="text-[10px] text-slate-400">{label}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-slate-900 font-display">{pct}</span>
          <span className="text-xs text-slate-400">%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Missing items — what to do next */}
      {missing.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Complete to improve score
          </p>
          {missing.slice(0, 4).map(item => (
            <button
              key={item.key}
              onClick={() => onGoToStep(item.step)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
            >
              <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span className="text-xs text-slate-500 flex-1 leading-tight">{item.tip}</span>
              <span className="text-[10px] text-slate-300 group-hover:text-brand-500 flex-shrink-0 transition-colors">
                +{item.points}pts
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-brand-500 flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Completed items */}
      {done.length > 0 && (
        <div className="space-y-1">
          {done.slice(0, 3).map(item => (
            <div key={item.key} className="flex items-center gap-2 px-2 py-1">
              <CheckCircle className="w-3.5 h-3.5 text-success-500 flex-shrink-0" />
              <span className="text-xs text-slate-400 line-through">{item.label}</span>
            </div>
          ))}
          {done.length > 3 && (
            <p className="text-[10px] text-slate-400 px-2">
              +{done.length - 3} more completed
            </p>
          )}
        </div>
      )}

      {pct === 100 && (
        <div className="mt-2 p-2.5 bg-success-50 rounded-xl border border-success-200">
          <p className="text-xs font-semibold text-success-700 text-center">
            🎉 Profile 100% complete!
          </p>
        </div>
      )}
    </div>
  )
}
