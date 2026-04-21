'use client'


import { useState, useTransition, useEffect } from 'react'
import { useRouter }                           from 'next/navigation'
import { toast }                               from 'sonner'
import {
  CreditCard, CheckCircle2, AlertCircle, Clock,
  Loader2, ExternalLink, Zap, Shield, BarChart2,
  Bell, Share2, X, ChevronRight, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types 
interface Subscription {
  plan:               string
  status:             string
  trialEndsAt:        string | null
  currentPeriodStart: string | null
  currentPeriodEnd:   string | null
  razorpayPaymentId:  string | null
}

interface Payment {
  id:          string
  amount:      number
  currency:    string
  status:      string
  description: string | null
  paymentId:   string | null
  createdAt:   string
}

interface Props {
  subscription: Subscription | null
  payments:     Payment[]
  userEmail:    string
  userName:     string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function daysLeft(iso: string | null): number {
  if (!iso) return 0
  return Math.max(0, Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))
}

function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

// ─── Pro features list ────────────────────────────────────────────────────────
const PRO_FEATURES = [
  { icon: Zap,       text: 'Profile live on talrat.com forever'          },
  { icon: Bell,      text: 'Instant WhatsApp alerts for every lead'      },
  { icon: BarChart2, text: 'Full analytics — views, sources, locations'  },
  { icon: Share2,    text: 'Share kit — 4 channel templates + QR code'   },
  { icon: Shield,    text: 'Priority support'                            },
]

// ─── Plan status card ─────────────────────────────────────────────────────────
function PlanCard({ sub }: { sub: Subscription | null }) {
  const status = sub?.status ?? 'TRIAL'
  const isPro  = status === 'ACTIVE'
  const isCancelled = status === 'CANCELLED'
  const days   = daysLeft(sub?.trialEndsAt ?? sub?.currentPeriodEnd ?? null)

  if (isPro || isCancelled) {
    return (
      <div className={cn(
        'rounded-2xl border p-6',
        isPro ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-200'
      )}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                isPro
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-400 text-white'
              )}>
                {isPro ? 'PRO' : 'Cancelled'}
              </span>
              {isPro && (
                <span className="text-xs text-success-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 font-display mt-2">
              ₹499 <span className="text-sm font-normal text-slate-500">/ month</span>
            </p>
          </div>
          <CreditCard className={cn(
            'w-8 h-8',
            isPro ? 'text-brand-400' : 'text-slate-300'
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Current period</p>
            <p className="font-medium text-slate-700">
              {formatDate(sub?.currentPeriodStart ?? null)} – {formatDate(sub?.currentPeriodEnd ?? null)}
            </p>
          </div>
          {isCancelled && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Access until</p>
              <p className="font-medium text-slate-700">{formatDate(sub?.currentPeriodEnd ?? null)}</p>
            </div>
          )}
        </div>

        {isCancelled && (
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-xl">
            <p className="text-xs text-warning-700 font-medium">
              Your PRO access continues until {formatDate(sub?.currentPeriodEnd ?? null)}.
              After that your profile will go offline.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Trial state
  const trialExpired = days === 0
  return (
    <div className={cn(
      'rounded-2xl border p-6',
      trialExpired
        ? 'bg-danger-50 border-danger-200'
        : days <= 7
        ? 'bg-warning-50 border-warning-200'
        : 'bg-slate-50 border-slate-200'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'w-5 h-5',
            trialExpired ? 'text-danger-500' : days <= 7 ? 'text-warning-500' : 'text-slate-400'
          )} />
          <span className="text-sm font-semibold text-slate-700">Free trial</span>
        </div>
        <span className={cn(
          'text-xs font-bold px-2.5 py-1 rounded-full',
          trialExpired
            ? 'bg-danger-100 text-danger-700'
            : days <= 7
            ? 'bg-warning-100 text-warning-700'
            : 'bg-slate-100 text-slate-600'
        )}>
          {trialExpired ? 'Expired' : `${days} days left`}
        </span>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed">
        {trialExpired
          ? 'Your trial has ended. Upgrade to keep your profile live and receiving leads.'
          : `Your profile is live during your 30-day free trial. Upgrade before it ends to keep everything running.`
        }
      </p>
    </div>
  )
}

// ─── Cancel modal ──────────────────────────────────────────────────────────────
function CancelModal({
  periodEnd,
  onConfirm,
  onClose,
  loading,
}: {
  periodEnd: string | null
  onConfirm: () => void
  onClose:   () => void
  loading:   boolean
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 font-display">Cancel subscription</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl mb-5">
          <p className="text-sm text-warning-800 font-medium mb-1">Before you cancel</p>
          <p className="text-xs text-warning-700 leading-relaxed">
            Your PRO access and profile will remain live until{' '}
            <strong>{formatDate(periodEnd)}</strong>. After that, your profile will
            go offline and you will stop receiving lead notifications.
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {['Profile will go offline', 'Lead notifications will stop', 'Analytics data will be retained'].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-500">
              <X className="w-3.5 h-3.5 text-danger-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Keep PRO
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-danger-500 text-white text-sm font-semibold rounded-xl hover:bg-danger-600 disabled:opacity-50 transition-colors"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Cancelling...</>
              : 'Yes, cancel'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Razorpay checkout ────────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: any
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BillingClient({ subscription, payments, userEmail, userName }: Props) {
  const router       = useRouter()
  const [showCancel, setShowCancel]     = useState(false)
  const [payPending, startPay]          = useTransition()
  const [cancelPending, startCancel]    = useTransition()
  const [rzpLoaded, setRzpLoaded]       = useState(false)

  const isPro        = subscription?.status === 'ACTIVE'
  const isCancelled  = subscription?.status === 'CANCELLED'
  const canUpgrade   = !isPro && !isCancelled

  // Load Razorpay script
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.Razorpay) { setRzpLoaded(true); return }

    const script  = document.createElement('script')
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async  = true
    script.onload = () => setRzpLoaded(true)
    document.head.appendChild(script)
  }, [])

  // ── Upgrade flow ────────────────────────────────────────────────────────────
  function handleUpgrade() {
    startPay(async () => {
      try {
        // 1. Create order on server
        const res = await fetch('/api/billing/create-order', { method: 'POST' })
        const order = await res.json()

        if (!res.ok) {
          toast.error(order.error ?? 'Could not start checkout')
          return
        }

        // 2. Mock mode (no Razorpay keys)
        if (order.mock) {
          toast.info('Mock payment — activating PRO in dev mode')
          const verify = await fetch('/api/billing/verify', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              razorpay_order_id:   order.orderId,
              razorpay_payment_id: 'pay_mock_' + Date.now(),
              razorpay_signature:  'mock_signature',
            }),
          })
          if (verify.ok) {
            toast.success('PRO activated! 🎉')
            router.refresh()
          }
          return
        }

        // 3. Open Razorpay checkout modal
        if (!window.Razorpay) {
          toast.error('Payment gateway not loaded. Please refresh and try again.')
          return
        }

        const rzp = new window.Razorpay({
          key:         order.keyId,
          amount:      order.amount,
          currency:    order.currency,
          order_id:    order.orderId,
          name:        'talrat',
          description: 'talrat PRO — monthly',
          image:       '/logo.png',
          prefill: {
            name:  userName,
            email: userEmail,
          },
          theme: { color: '#0a66c2' },

          handler: async function(response: any) {
            // 4. Verify payment server-side
            const verifyRes = await fetch('/api/billing/verify', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            })

            const result = await verifyRes.json()

            if (verifyRes.ok && result.success) {
              toast.success('Payment successful! PRO is now active 🎉')
              router.refresh()
            } else {
              toast.error(result.error ?? 'Payment verification failed. Please contact support.')
            }
          },

          modal: {
            ondismiss: () => {
              toast.info('Payment cancelled')
            },
          },
        })

        rzp.open()
      } catch (error) {
        console.error('Upgrade error:', error)
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  // ── Cancel flow ─────────────────────────────────────────────────────────────
  function handleCancelConfirm() {
    startCancel(async () => {
      try {
        const res    = await fetch('/api/billing/cancel', { method: 'POST' })
        const result = await res.json()

        if (!res.ok) {
          toast.error(result.error ?? 'Could not cancel subscription')
          return
        }

        toast.success('Subscription cancelled. Access continues until end of billing period.')
        setShowCancel(false)
        router.refresh()
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <>
      <div className="max-w-2xl space-y-6 animate-fade-up">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Billing</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your plan and payment history</p>
        </div>

        {/* ── Plan status ── */}
        <PlanCard sub={subscription} />

        {/* ── Upgrade CTA ── */}
        {canUpgrade && (
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Upgrade to PRO
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Keep your profile live and growing. Cancel anytime.
                </p>
              </div>
              <div className="ml-auto text-right flex-shrink-0">
                <p className="text-2xl font-bold text-slate-900 font-display">₹499</p>
                <p className="text-xs text-slate-400">per month</p>
              </div>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-2.5 mb-6">
              {PRO_FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-success-50 rounded-md flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-success-600" />
                  </div>
                  <p className="text-xs text-slate-600">{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={payPending || !rzpLoaded}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-brand"
            >
              {payPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                : !rzpLoaded
                ? <><Loader2 className="w-4 h-4 animate-spin" />Loading payment...</>
                : <>Upgrade to PRO — ₹499/mo <ChevronRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-center text-xs text-slate-400 mt-3">
              Secure payment via Razorpay · UPI, cards, net banking accepted · Cancel anytime
            </p>
          </div>
        )}

        {/* ── Cancel button (for active PRO) ── */}
        {isPro && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Cancel subscription</h2>
            <p className="text-xs text-slate-500 mb-4">
              {"You'll retain PRO access until"}
              <strong>{formatDate(subscription?.currentPeriodEnd ?? null)}</strong>.
              After that your profile will go offline.
            </p>
            <button
              onClick={() => setShowCancel(true)}
              className="text-sm text-danger-500 hover:text-danger-700 font-medium transition-colors"
            >
              Cancel subscription →
            </button>
          </div>
        )}

        {/* ── Payment history ── */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Payment history</h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No payments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map(payment => (
                <div key={payment.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    payment.status === 'CAPTURED'
                      ? 'bg-success-50'
                      : 'bg-danger-50'
                  )}>
                    {payment.status === 'CAPTURED'
                      ? <CheckCircle2 className="w-4 h-4 text-success-600" />
                      : <AlertCircle  className="w-4 h-4 text-danger-500"  />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {payment.description ?? 'talrat PRO'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(payment.createdAt)}
                      {payment.paymentId && (
                        <span className="ml-2 font-mono">{payment.paymentId.slice(-8)}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatINR(payment.amount)}
                    </p>
                    <p className={cn(
                      'text-[10px] font-medium uppercase',
                      payment.status === 'CAPTURED' ? 'text-success-600' : 'text-danger-500'
                    )}>
                      {payment.status === 'CAPTURED' ? 'Paid' : 'Failed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Support note ── */}
        <p className="text-xs text-slate-400 text-center">
          Questions about billing?{' '}
          <a href="mailto:hello@talrat.com" className="text-brand-600 hover:underline">
            hello@talrat.com
          </a>
        </p>
      </div>

      {/* ── Cancel modal ── */}
      {showCancel && (
        <CancelModal
          periodEnd={subscription?.currentPeriodEnd ?? null}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancel(false)}
          loading={cancelPending}
        />
      )}
    </>
  )
}
