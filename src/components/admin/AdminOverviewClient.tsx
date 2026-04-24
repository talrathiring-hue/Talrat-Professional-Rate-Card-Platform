'use client'
// src/components/admin/AdminOverviewClient.tsx
// Dark-themed admin metrics: MRR, ARR, user counts, signup chart

import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, CreditCard, TrendingUp,
  AlertCircle, BarChart2, FileText,
  CheckCircle2,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

interface Props {
  data: {
    stats: {
      totalUsers:        number
      newUsers30d:       number
      newUsers7d:        number
      proUsers:          number
      trialUsers:        number
      totalProfiles:     number
      publishedProfiles: number
      totalLeads:        number
      openTickets:       number
      mrr:               number
      arr:               number
      totalRevenuePaise: number
    }
    signupChart:   { date: string; value: number }[]
    recentSignups: {
      id:           string
      name:         string | null
      email:        string | null
      createdAt:    string
      subscription: { plan: string; status: string } | null
      profile:      { slug: string; isPublished: boolean } | null
    }[]
  }
}

function MetricCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; accent: string
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', accent)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0]?.value} signups</p>
    </div>
  )
}

export function AdminOverviewClient({ data }: Props) {
  const { stats, signupChart, recentSignups } = data

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Business metrics and platform health</p>
      </div>

      {/* Revenue KPIs */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Revenue</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="MRR"          value={formatINR(stats.mrr)}  sub={`${stats.proUsers} PRO users`}   icon={CreditCard}  accent="bg-brand-900/60 text-brand-400" />
          <MetricCard label="ARR"          value={formatINR(stats.arr)}  sub="Annualised"                      icon={TrendingUp}  accent="bg-green-900/60 text-green-400" />
          <MetricCard label="Total revenue" value={formatINR(Math.round(stats.totalRevenuePaise / 100))} sub="All captured payments" icon={BarChart2} accent="bg-purple-900/60 text-purple-400" />
        </div>
      </div>

      {/* User KPIs */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Users</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total users"   value={stats.totalUsers}         sub="All time"                  icon={Users}       accent="bg-slate-700 text-slate-300"     />
          <MetricCard label="New (30d)"     value={stats.newUsers30d}        sub={`${stats.newUsers7d} this week`} icon={TrendingUp} accent="bg-blue-900/60 text-blue-400" />
          <MetricCard label="PRO"           value={stats.proUsers}           sub="Paying subscribers"        icon={CreditCard}  accent="bg-brand-900/60 text-brand-400"  />
          <MetricCard label="Free trial"    value={stats.trialUsers}         sub="Active trials"             icon={Users}       accent="bg-amber-900/60 text-amber-400"  />
        </div>
      </div>

      {/* Platform KPIs */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Platform</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Profiles"      value={stats.totalProfiles}      sub={`${stats.publishedProfiles} live`} icon={FileText}   accent="bg-teal-900/60 text-teal-400"    />
          <MetricCard label="Total leads"   value={stats.totalLeads}         sub="All time"                  icon={Users}       accent="bg-green-900/60 text-green-400"  />
          <MetricCard label="Open tickets"  value={stats.openTickets}        sub="Needs attention"           icon={AlertCircle} accent="bg-red-900/60 text-red-400"      />
          <MetricCard label="Conversion"    value={`${stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`} sub="Trial → PRO" icon={TrendingUp} accent="bg-purple-900/60 text-purple-400" />
        </div>
      </div>

      {/* Signup chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">New signups — last 30 days</h2>
          <span className="text-xs text-slate-500">{stats.newUsers30d} total</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={signupChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0a66c2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0a66c2" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#0a66c2" strokeWidth={2} fill="url(#sg)" dot={false} activeDot={{ r: 4, fill: '#0a66c2', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent signups */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent signups</h2>
          <a href="/admin/users" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="divide-y divide-slate-700/40">
          {recentSignups.map(u => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/30 transition-colors">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center text-brand-400 text-sm font-bold flex-shrink-0">
                {(u.name || u.email || '?')[0].toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.name || '—'}</p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
              {/* Status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {u.subscription && (
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    u.subscription.status === 'ACTIVE'
                      ? 'bg-green-900/60 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  )}>
                    {u.subscription.status === 'ACTIVE' ? 'PRO' : 'Trial'}
                  </span>
                )}
                {u.profile?.isPublished && (
                 <CheckCircle2 className="w-3.5 h-3.5 text-green-400"
  aria-label="Profile published"
/>
                )}
                <span className="text-xs text-slate-500">{timeAgo(u.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
