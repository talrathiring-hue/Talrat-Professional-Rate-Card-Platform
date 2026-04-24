'use client'
// Tabbed settings UI:
// Tab 1 — Account: name, phone, avatar, danger zone
// Tab 2 — Notifications: email + WhatsApp toggles, weekly digest
// Tab 3 — Support: ticket list + new ticket form

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import { signOut }                  from 'next-auth/react'
import { toast }                    from 'sonner'
import {
  User, Bell, HelpCircle, Loader2, Check,
  Mail, MessageSquare, BarChart2,
  AlertTriangle, X, ChevronDown, ChevronUp,
  Clock, CheckCircle2, AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { cn, initials, timeAgo } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserData {
  id:        string
  name:      string | null
  email:     string | null
  phone:     string | null
  image:     string | null
  role:      string
  createdAt: string
}

interface NotifPrefs {
  emailOnLead:    boolean
  whatsappOnLead: boolean
  weeklyDigest:   boolean
}

interface TicketMessage {
  id:        string
  body:      string
  isAdmin:   boolean
  createdAt: string
}

interface Ticket {
  id:        string
  subject:   string
  category:  string
  priority:  string
  status:    string
  createdAt: string
  updatedAt: string
  messages:  TicketMessage[]
}

interface Props {
  user:    UserData
  prefs:   NotifPrefs
  tickets: Ticket[]
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'account',       label: 'Account',       icon: User       },
  { id: 'notifications', label: 'Notifications', icon: Bell       },
  { id: 'support',       label: 'Support',       icon: HelpCircle },
]

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-brand-600' : 'bg-slate-200'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
        checked ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, desc, children }: {
  title: string; desc?: string; children: React.ReactNode
}) {
  return (
    <div className="card p-6">
      <div className="mb-5 pb-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Ticket status badge ──────────────────────────────────────────────────────
function TicketBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    OPEN:        { label: 'Open',        cls: 'bg-brand-50 text-brand-700 border-brand-200'   },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-warning-50 text-warning-700 border-warning-200' },
    RESOLVED:    { label: 'Resolved',    cls: 'bg-success-50 text-success-700 border-success-200' },
    CLOSED:      { label: 'Closed',      cls: 'bg-slate-100 text-slate-500 border-slate-200'  },
  }
  const { label, cls } = map[status] ?? map.OPEN
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', cls)}>
      {label}
    </span>
  )
}

// ─── TAB 1: Account ───────────────────────────────────────────────────────────
function AccountTab({ user }: { user: UserData }) {
  const router                        = useRouter()
  const [name, setName]               = useState(user.name ?? '')
  const [phone, setPhone]             = useState(user.phone ?? '')
  const [deleteInput, setDeleteInput] = useState('')
  const [showDelete, setShowDelete]   = useState(false)
  const [saving, startSave]           = useTransition()
  const [deleting, startDelete]       = useTransition()

  async function saveAccount() {
    startSave(async () => {
      const res = await fetch('/api/settings/account', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.issues?.[0]?.message ?? data.error ?? 'Save failed')
      } else {
        toast.success('Account updated!')
        router.refresh()
      }
    })
  }

  async function deleteAccount() {
    if (deleteInput !== 'delete my account') return
    startDelete(async () => {
      const res = await fetch('/api/settings/account', { method: 'DELETE' })
      if (res.ok) {
        toast.success('Account deleted. Goodbye!')
        await signOut({ callbackUrl: '/' })
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Deletion failed. Contact support.')
      }
    })
  }

  return (
    <div className="space-y-5">
      <Section title="Profile info" desc="Your name and phone number used across talrat">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          {user.image ? (
            <img src={user.image} alt={user.name ?? ''} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold font-display">
              {initials(user.name || user.email || 'T')}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{user.name ?? '—'}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Display name</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Priya Sharma"
              maxLength={80}
            />
          </div>

          {/* Email (read only) */}
          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <input
                className="input bg-slate-50 text-slate-400 cursor-not-allowed"
                value={user.email ?? ''}
                readOnly
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Managed by Google
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Email is linked to your Google account and cannot be changed here.
            </p>
          </div>

          {/* Phone — critical for WhatsApp notifications */}
          <div>
            <label className="label">
              WhatsApp number
              <span className="ml-1 text-xs text-slate-400 font-normal">(for lead notifications)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center text-sm text-slate-500">
                +91
              </span>
              <input
                className="input flex-1"
                value={phone.replace('+91', '').replace(/^\+91/, '')}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                type="tel"
                inputMode="numeric"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              You'll get instant WhatsApp messages when clients contact you
            </p>
          </div>

          <button
            onClick={saveAccount}
            disabled={saving}
            className="btn-primary"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              : <><Check className="w-4 h-4" />Save changes</>
            }
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <div className="card border-danger-200 p-6">
        <div className="mb-5 pb-4 border-b border-danger-100">
          <h2 className="text-base font-semibold text-danger-700">Danger zone</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Permanent actions that cannot be undone
          </p>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Delete account</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently delete your account, profile, leads, and all data.
            </p>
          </div>
          <button
            onClick={() => setShowDelete(v => !v)}
            className="btn-secondary text-danger-600 hover:bg-danger-50 border-danger-200 text-sm flex-shrink-0 ml-4"
          >
            Delete account
          </button>
        </div>

        {showDelete && (
          <div className="mt-5 p-4 bg-danger-50 border border-danger-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-danger-800">This cannot be undone</p>
                <p className="text-xs text-danger-600 mt-0.5 leading-relaxed">
                  Your profile, all leads, analytics, and payment history will be permanently deleted.
                  Your subscription will not be refunded.
                </p>
              </div>
            </div>
            <label className="label text-danger-700">
              Type <strong>delete my account</strong> to confirm
            </label>
            <input
              className="input border-danger-300 focus:ring-danger-400 mb-3"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="delete my account"
            />
            <button
              onClick={deleteAccount}
              disabled={deleteInput !== 'delete my account' || deleting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-danger-600 text-white text-sm font-semibold rounded-xl hover:bg-danger-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {deleting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</>
                : 'Permanently delete my account'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TAB 2: Notifications ─────────────────────────────────────────────────────
function NotificationsTab({ prefs: initial, hasPhone }: { prefs: NotifPrefs; hasPhone: boolean }) {
  const router              = useRouter()
  const [prefs, setPrefs]   = useState(initial)
  const [saving, startSave] = useTransition()

  async function update(key: keyof NotifPrefs, val: boolean) {
    const next = { ...prefs, [key]: val }
    setPrefs(next)

    startSave(async () => {
      const res = await fetch('/api/settings/notifications', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [key]: val }),
      })
      if (!res.ok) {
        setPrefs(prefs) // rollback
        toast.error('Failed to update. Try again.')
      } else {
        toast.success('Preference saved')
        router.refresh()
      }
    })
  }

  const rows: {
    key:     keyof NotifPrefs
    icon:    React.ElementType
    title:   string
    desc:    string
    warn?:   string
  }[] = [
    {
      key:  'emailOnLead',
      icon: Mail,
      title: 'Email on new lead',
      desc:  'Get an email every time someone contacts you through your profile',
    },
    {
      key:  'whatsappOnLead',
      icon: MessageSquare,
      title: 'WhatsApp on new lead',
      desc:  'Get an instant WhatsApp message when someone fills your contact form',
      warn:  !hasPhone ? 'Add your WhatsApp number in Account settings to enable this' : undefined,
    },
    {
      key:  'weeklyDigest',
      icon: BarChart2,
      title: 'Weekly analytics digest',
      desc:  'A summary of your profile views and leads every Monday morning',
    },
  ]

  return (
    <Section title="Notification preferences" desc="Choose how you hear about new leads and activity">
      <div className="space-y-5">
        {rows.map(({ key, icon: Icon, title, desc, warn }) => (
          <div key={key} className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <Toggle
                  checked={prefs[key]}
                  onChange={v => update(key, v)}
                  disabled={saving || (key === 'whatsappOnLead' && !hasPhone)}
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              {warn && (
                <p className="text-xs text-warning-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {warn}
                </p>
              )}
            </div>
          </div>
        ))}

        {saving && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </div>
        )}
      </div>
    </Section>
  )
}

// ─── TAB 3: Support ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'BILLING',         label: 'Billing & payments' },
  { value: 'TECHNICAL',       label: 'Technical issue'    },
  { value: 'ACCOUNT',         label: 'Account'            },
  { value: 'FEATURE_REQUEST', label: 'Feature request'    },
  { value: 'OTHER',           label: 'Other'              },
]

function SupportTab({ tickets: initial }: { tickets: Ticket[] }) {
  const [tickets, setTickets]       = useState(initial)
  const [showForm, setShowForm]     = useState(false)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [subject, setSubject]       = useState('')
  const [message, setMessage]       = useState('')
  const [category, setCategory]     = useState('TECHNICAL')
  const [submitting, startSubmit]   = useTransition()

  async function createTicket() {
    if (!subject.trim() || !message.trim()) {
      toast.error('Fill in both subject and message')
      return
    }

    startSubmit(async () => {
      const res = await fetch('/api/tickets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subject: subject.trim(), message: message.trim(), category }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.issues?.[0]?.message ?? data.error ?? 'Could not create ticket')
      } else {
        setTickets(t => [data.ticket, ...t])
        setShowForm(false)
        setSubject('')
        setMessage('')
        setCategory('TECHNICAL')
        toast.success('Ticket submitted! We typically respond within 24 hours.')
      }
    })
  }

  const statusIcon = (s: string) => ({
    OPEN:        <Clock         className="w-3.5 h-3.5 text-brand-500"   />,
    IN_PROGRESS: <Loader2       className="w-3.5 h-3.5 text-warning-500" />,
    RESOLVED:    <CheckCircle2  className="w-3.5 h-3.5 text-success-500" />,
    CLOSED:      <X             className="w-3.5 h-3.5 text-slate-400"   />,
  }[s] ?? null)

  return (
    <div className="space-y-5">
      {/* Header + new ticket button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Support tickets</h2>
          <p className="text-xs text-slate-500 mt-0.5">We respond within 24 hours on business days</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            New ticket
          </button>
        )}
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="card p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">New support ticket</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Category</label>
              <select
                className="input bg-white"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Subject</label>
              <input
                className="input"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                maxLength={120}
              />
            </div>

            <div>
              <label className="label">Message</label>
              <textarea
                className="textarea"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe the issue in detail. Include any error messages you see."
                maxLength={2000}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/2000</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={createTicket}
                disabled={submitting || !subject.trim() || !message.trim()}
                className="btn-primary flex-1 justify-center"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                  : 'Submit ticket'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="card p-10 text-center">
          <HelpCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 mb-1">No tickets yet</p>
          <p className="text-xs text-slate-400">
            Have a question or issue? Open a support ticket and we'll help.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="card overflow-hidden">
              {/* Ticket header */}
              <button
                onClick={() => setExpanded(e => e === ticket.id ? null : ticket.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="mt-0.5">{statusIcon(ticket.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 truncate">{ticket.subject}</p>
                    <TicketBadge status={ticket.status} />
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {CATEGORIES.find(c => c.value === ticket.category)?.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(ticket.createdAt)}</p>
                </div>
                {expanded === ticket.id
                  ? <ChevronUp   className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
              </button>

              {/* Ticket messages */}
              {expanded === ticket.id && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60 space-y-3 animate-fade-in">
                  {ticket.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        'rounded-xl p-3 text-xs leading-relaxed',
                        msg.isAdmin
                          ? 'bg-brand-50 border border-brand-100 text-brand-900 ml-6'
                          : 'bg-white border border-slate-200 text-slate-700 mr-6'
                      )}
                    >
                      <p className="font-semibold mb-1 text-[10px] uppercase tracking-wide opacity-60">
                        {msg.isAdmin ? 'talrat support' : 'You'} · {timeAgo(msg.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  ))}

                  {ticket.status === 'OPEN' && (
                    <p className="text-xs text-slate-400 text-center py-1">
                      We'll reply here and notify you by email
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact fallback */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs text-slate-500 text-center">
          Need urgent help?{' '}
          <a
            href="mailto:hello@talrat.com"
            className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
          >
            Email hello@talrat.com <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SettingsClient({ user, prefs, tickets }: Props) {
  const [tab, setTab] = useState<'account' | 'notifications' | 'support'>('account')

  return (
    <div className="animate-fade-up max-w-2xl">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              tab === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === 'account'       && <AccountTab user={user} />}
      {tab === 'notifications' && <NotificationsTab prefs={prefs} hasPhone={!!user.phone} />}
      {tab === 'support'       && <SupportTab tickets={tickets} />}
    </div>
  )
}
