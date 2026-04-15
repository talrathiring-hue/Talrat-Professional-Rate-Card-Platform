// src/app/dashboard/profile/page.tsx
// Placeholder — full 5-step profile builder built on Day 7

import Link from 'next/link'
import { User, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile' }

export default function ProfilePage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Profile Builder</h1>
        <p className="text-slate-500 text-sm mt-1">Build your 5-step rate card</p>
      </div>
      <div className="card p-10 text-center max-w-md mx-auto">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-7 h-7 text-brand-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-slate-500 mb-4">
          The 5-step profile builder wizard — talent type, rate card, skills, work samples, and publish.
        </p>
        <div className="badge badge-brand text-xs"></div>
      </div>
    </div>
  )
}
