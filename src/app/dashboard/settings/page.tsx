
import { Settings } from 'lucide-react'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Settings' }
export default function SettingsPage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Account and notifications</p>
      </div>
      <div className="card p-10 text-center max-w-md mx-auto">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-7 h-7 text-slate-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-slate-500 mb-4">
          Account info, notification preferences (email/WhatsApp toggles), support tickets.
        </p>
        <div className="badge badge-brand text-xs"></div>
      </div>
    </div>
  )
}
