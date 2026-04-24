'use client'
// src/components/admin/AdminUsersClient.tsx

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { toast }                   from 'sonner'
import {
  Search, ExternalLink, Ban, CheckCircle,
  Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn, timeAgo, formatNumber } from '@/lib/utils'

interface User {
  id:        string
  name:      string | null
  email:     string | null
  phone:     string | null
  role:      string
  isBlocked: boolean
  createdAt: string
  subscription: {
    plan:        string
    status:      string
    trialEndsAt: string | null
  } | null
  profile: {
    slug:        string
    isPublished: boolean
    totalViews:  number
    totalLeads:  number
  } | null
}

interface Props {
  users:      User[]
  total:      number
  page:       number
  pageSize:   number
  query:      string
  planFilter: string
}

export function AdminUsersClient({ users, total, page, pageSize, query, planFilter }: Props) {
  const router             = useRouter()
  const [search, setSearch] = useState(query)
  const [pending, start]   = useTransition()
  const totalPages         = Math.ceil(total / pageSize)

  function navigate(params: Record<string, string>) {
    const url = new URLSearchParams({
      q:    params.q    ?? query,
      plan: params.plan ?? planFilter,
      page: params.page ?? '1',
    })
    router.push(`/admin/users?${url}`)
  }

  async function toggleBlock(userId: string, block: boolean) {
    start(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isBlocked: block }),
      })
      if (res.ok) {
        toast.success(block ? 'User blocked' : 'User unblocked')
        router.refresh()
      } else {
        toast.error('Action failed')
      }
    })
  }

  async function makeAdmin(userId: string) {
    start(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role: 'ADMIN' }),
      })
      if (res.ok) { toast.success('User promoted to ADMIN'); router.refresh() }
      else         toast.error('Action failed')
    })
  }

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">{formatNumber(total)} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate({ q: search })}
          />
        </div>
        <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-0.5 gap-0.5">
          {[
            { v: 'all',   l: 'All'   },
            { v: 'pro',   l: 'PRO'   },
            { v: 'trial', l: 'Trial' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => navigate({ plan: v })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                planFilter === v
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Thead */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-slate-700/50">
          {['User', 'Plan', 'Profile', 'Joined', 'Actions'].map(h => (
            <p key={h} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {users.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500 text-sm">No users found</div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {users.map(u => (
              <div
                key={u.id}
                className={cn(
                  'grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 items-center px-5 py-3.5 hover:bg-slate-700/20 transition-colors',
                  u.isBlocked && 'opacity-60'
                )}
              >
                {/* User */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {u.name || '—'}
                    </p>
                    {u.role === 'ADMIN' && (
                      <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                        Admin
                      </span>
                    )}
                    {u.isBlocked && (
                      <span className="text-[9px] bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase">
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  {u.phone && <p className="text-xs text-slate-500">{u.phone}</p>}
                </div>

                {/* Plan */}
                <div>
                  {u.subscription ? (
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      u.subscription.status === 'ACTIVE'
                        ? 'bg-brand-900/60 text-brand-400'
                        : u.subscription.status === 'TRIAL'
                        ? 'bg-amber-900/60 text-amber-400'
                        : 'bg-slate-700 text-slate-400'
                    )}>
                      {u.subscription.status === 'ACTIVE' ? 'PRO' : u.subscription.status}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>

                {/* Profile */}
                <div>
                  {u.profile ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/${u.profile.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-400 hover:text-brand-300 font-mono truncate flex items-center gap-1"
                      >
                        /{u.profile.slug}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">No profile</span>
                  )}
                  {u.profile && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {u.profile.totalViews}v · {u.profile.totalLeads}l
                    </p>
                  )}
                </div>

                {/* Joined */}
                <p className="text-xs text-slate-400">{timeAgo(u.createdAt)}</p>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleBlock(u.id, !u.isBlocked)}
                    disabled={pending}
                    title={u.isBlocked ? 'Unblock user' : 'Block user'}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    {u.isBlocked
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      : <Ban         className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} · {total} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ page: String(page - 1) })}
              disabled={page <= 1}
              className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <button
              onClick={() => navigate({ page: String(page + 1) })}
              disabled={page >= totalPages}
              className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30 flex items-center gap-1"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
