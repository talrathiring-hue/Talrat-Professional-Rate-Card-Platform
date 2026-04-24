'use client'
// src/components/admin/AdminTicketsClient.tsx

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { toast }                   from 'sonner'
import {
  ChevronDown, ChevronUp, Send,
  Loader2, Clock, CheckCircle2, X,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

interface Message {
  id:        string
  body:      string
  isAdmin:   boolean
  createdAt: string
}

interface Ticket {
  id:        string
  subject:   string
  category:  string
  status:    string
  priority:  string
  createdAt: string
  updatedAt: string
  user:      { id: string; name: string | null; email: string | null }
  messages:  Message[]
}

interface Props {
  tickets:       Ticket[]
  statusFilter:  string
  openCount:     number
  resolvedCount: number
}

const STATUS_COLORS: Record<string, string> = {
  OPEN:        'bg-brand-900/60 text-brand-400',
  IN_PROGRESS: 'bg-amber-900/60 text-amber-400',
  RESOLVED:    'bg-green-900/60 text-green-400',
  CLOSED:      'bg-slate-700 text-slate-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW:    'text-slate-500',
  MEDIUM: 'text-amber-400',
  HIGH:   'text-red-400',
  URGENT: 'text-red-500',
}

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export function AdminTicketsClient({
  tickets, statusFilter, openCount, resolvedCount,
}: Props) {
  const router               = useRouter()
  const [expanded, setExpanded] = useState<string | null>(tickets[0]?.id ?? null)
  const [replyText, setReply]   = useState('')
  const [pending, start]        = useTransition()

  function navigate(status: string) {
    router.push(`/admin/tickets?status=${status}`)
  }

  async function sendReply(ticketId: string) {
    if (!replyText.trim()) return
    start(async () => {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ body: replyText.trim() }),
      })
      if (res.ok) {
        toast.success('Reply sent')
        setReply('')
        router.refresh()
      } else {
        toast.error('Failed to send reply')
      }
    })
  }

  async function updateStatus(ticketId: string, status: string) {
    start(async () => {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (res.ok) { toast.success('Status updated'); router.refresh() }
      else          toast.error('Failed to update status')
    })
  }

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Support tickets</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {openCount} open · {resolvedCount} resolved
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-0.5 gap-0.5 w-fit">
        <button
          onClick={() => navigate('open')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            statusFilter === 'open'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          )}
        >
          Open
          {openCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {openCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('resolved')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            statusFilter === 'resolved'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          )}
        >
          Resolved
        </button>
      </div>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-10 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <p className="text-slate-400">No {statusFilter} tickets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              {/* Ticket header */}
              <button
                onClick={() => setExpanded(e => e === ticket.id ? null : ticket.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', STATUS_COLORS[ticket.status] ?? STATUS_COLORS.OPEN)}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={cn('text-[10px] font-medium', PRIORITY_COLORS[ticket.priority] ?? '')}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                      {ticket.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {ticket.user.name || ticket.user.email} · {timeAgo(ticket.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-slate-500">{ticket.messages.length} msg</span>
                  {expanded === ticket.id
                    ? <ChevronUp   className="w-4 h-4 text-slate-500" />
                    : <ChevronDown className="w-4 h-4 text-slate-500" />
                  }
                </div>
              </button>

              {/* Expanded: messages + reply ──────────────────────────────── */}
              {expanded === ticket.id && (
                <div className="border-t border-slate-700/50 px-5 py-4 space-y-4">

                  {/* Status selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">Status:</span>
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(ticket.id, s)}
                        disabled={pending || ticket.status === s}
                        className={cn(
                          'text-[10px] font-bold px-2.5 py-1 rounded-full transition-all border',
                          ticket.status === s
                            ? (STATUS_COLORS[s] ?? '') + ' border-current'
                            : 'border-slate-700 text-slate-500 hover:text-white hover:border-slate-500'
                        )}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Message thread */}
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {ticket.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          'rounded-xl p-3 text-xs leading-relaxed',
                          msg.isAdmin
                            ? 'bg-brand-900/40 border border-brand-800/60 text-brand-200 ml-8'
                            : 'bg-slate-700/40 border border-slate-700/60 text-slate-300 mr-8'
                        )}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60 mb-1">
                          {msg.isAdmin ? '🛡️ talrat support' : `👤 ${ticket.user.name || 'User'}`}
                          {' · '}{timeAgo(msg.createdAt)}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply box */}
                  {!['RESOLVED', 'CLOSED'].includes(ticket.status) && (
                    <div className="space-y-2">
                      <textarea
                        className="w-full bg-slate-700/40 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                        rows={3}
                        value={replyText}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Type your reply..."
                        maxLength={2000}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{replyText.length}/2000</span>
                        <button
                          onClick={() => sendReply(ticket.id)}
                          disabled={pending || !replyText.trim()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
                        >
                          {pending
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending...</>
                            : <><Send className="w-3.5 h-3.5" />Send reply</>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
