
import { BarChart2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics' }

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Views, leads, sources and locations</p>
      </div>
      <div className="card p-10 text-center max-w-md mx-auto">
        <div className="w-14 h-14 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-7 h-7 text-success-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-slate-500 mb-4">
          Views over time, lead sources pie chart, visitor locations, and leads table with Recharts.
        </p>
        <div className="badge badge-brand text-xs"></div>
      </div>
    </div>
  )
}
