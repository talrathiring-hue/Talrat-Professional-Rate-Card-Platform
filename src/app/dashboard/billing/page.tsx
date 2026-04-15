
import { CreditCard } from 'lucide-react'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Billing' }
export default function BillingPage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Billing</h1>
        <p className="text-slate-500 text-sm mt-1">Plan and payment history</p>
      </div>
      <div className="card p-10 text-center max-w-md mx-auto">
        <div className="w-14 h-14 bg-warning-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7 text-warning-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-slate-500 mb-4">
          Razorpay integration, plan upgrade flow, payment history table, trial status.
        </p>
        <div className="badge badge-brand text-xs"></div>
      </div>
    </div>
  )
}
