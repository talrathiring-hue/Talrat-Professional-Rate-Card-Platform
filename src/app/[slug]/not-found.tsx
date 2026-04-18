// src/app/[slug]/not-found.tsx
// Shown when a profile slug doesn't exist or isn't published

import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-display mb-2">
          Profile not found
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          This profile doesn't exist or hasn't been published yet.
          Double-check the URL or search for the person on talrat.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to talrat.com
        </Link>
      </div>
    </div>
  )
}
