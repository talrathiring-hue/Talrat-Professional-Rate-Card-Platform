'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import {
  Eye, Users, TrendingUp, TrendingDown,
  Globe, ExternalLink, Clock, ChevronRight,
  Mail, Building2,
} from 'lucide-react'
import { cn, timeAgo, formatNumber } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalViews:  number
  viewsLast30: number
  viewsLast7:  number
  totalLeads:  number
  leadsLast30: number
  leadsLast7:  number
}

interface ChartPoint { date: string; value: number }

interface SourceRow    { source: string;   count: number }
interface LocationRow  { location: string; count: number }

interface Lead {
  id:        string
  name:      string
  email:     string
  company:   string | null
  message:   string
  source:    string | null
  createdAt: string
  notified:  boolean
}

interface Props {
  stats:          Stats
  viewsChart:     ChartPoint[]
  leadsChart:     ChartPoint[]
  topSources:     SourceRow[]
  topLocations:   LocationRow[]
  recentLeads:    Lead[]
  profileSlug:    string
}

// ─── Country code → flag + name ───────────────────────────────────────────────
const COUNTRY_NAMES: Record<string, string> = {
  IN: '🇮🇳 India',      US: '🇺🇸 USA',        GB: '🇬🇧 UK',
  SG: '🇸🇬 Singapore',  AE: '🇦🇪 UAE',         AU: '🇦🇺 Australia',
  CA: '🇨🇦 Canada',     DE: '🇩🇪 Germany',     NL: '🇳🇱 Netherlands',
  FR: '🇫🇷 France',     JP: '🇯🇵 Japan',        MY: '🇲🇾 Malaysia',
}

function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] ?? `🌍 ${code}`
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, iconBg, iconColor, trend,
}: {
  label: string; value: number | string; sub?: string
  icon: React.ElementType; iconBg: string; iconColor: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-4 h-4', iconColor)} />
        </div>
        {trend && trend !== 'neutral' && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
            trend === 'up'
              ? 'bg-success-50 text-success-600'
              : 'bg-danger-50 text-danger-600'
          )}>
            {trend === 'up'
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 font-display">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      <p className="text-sm text-slate-600 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Custom tooltip for Recharts ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card px-3 py-2 text-xs">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-slate-900">{payload[0]?.value}</p>
    </div>
  )
}

// ─── Period selector ──────────────────────────────────────────────────────────
type Period = '7d' | '30d'

function PeriodSelector({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  return (
    <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
      {(['7d', '30d'] as Period[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            value === p
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {p === '7d' ? '7 days' : '30 days'}
        </button>
      ))}
    </div>
  )
}

// ─── Source / location bar row ────────────────────────────────────────────────
function BarRow({ label, count, total, color }: {
  label: string; count: number; total: number; color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 font-medium truncate max-w-[160px]">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-slate-400">{pct}%</span>
          <span className="font-semibold text-slate-900 w-8 text-right">{count}</span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AnalyticsClient({
  stats, viewsChart, leadsChart,
  topSources, topLocations, recentLeads, profileSlug,
}: Props) {
  const [period, setPeriod]           = useState<Period>('30d')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Filter chart data based on period
  const viewsData = period === '7d' ? viewsChart.slice(-7)  : viewsChart
  const leadsData = period === '7d' ? leadsChart.slice(-7)  : leadsChart

  const totalSources   = topSources.reduce((s, r) => s + r.count, 0)
  const totalLocations = topLocations.reduce((s, r) => s + r.count, 0)

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'}/${profileSlug}`

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            How your profile is performing
          </p>
        </div>
        <a
          href={`/${profileSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View profile</span>
        </a>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total views"
          value={stats.totalViews}
          sub="All time"
          icon={Eye}
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
        />
        <StatCard
          label="Views this month"
          value={stats.viewsLast30}
          sub={`${stats.viewsLast7} this week`}
          icon={TrendingUp}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend={stats.viewsLast30 > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Total leads"
          value={stats.totalLeads}
          sub="All time"
          icon={Users}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          label="Leads this month"
          value={stats.leadsLast30}
          sub={`${stats.leadsLast7} this week`}
          icon={Mail}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
          trend={stats.leadsLast30 > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* ── Charts ── */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Profile views over time
          </h2>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {viewsData.every(d => d.value === 0) ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No views yet in this period</p>
              <p className="text-xs text-slate-300 mt-1">
                Share your profile to start getting views
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={viewsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0a66c2" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0a66c2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={period === '7d' ? 0 : 4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0a66c2"
                strokeWidth={2}
                fill="url(#viewsGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#0a66c2', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Sources + Locations ── */}
      <div className="grid sm:grid-cols-2 gap-6">

        {/* Traffic sources */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Traffic sources</h2>
            <span className="ml-auto text-xs text-slate-400">Last 30 days</span>
          </div>

          {topSources.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-400">No data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topSources.map(({ source, count }) => (
                <BarRow
                  key={source}
                  label={source}
                  count={count}
                  total={totalSources}
                  color="bg-brand-500"
                />
              ))}
            </div>
          )}
        </div>

        {/* Visitor locations */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Visitor locations</h2>
            <span className="ml-auto text-xs text-slate-400">Last 30 days</span>
          </div>

          {topLocations.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-400">No location data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topLocations.map(({ location, count }) => (
                <BarRow
                  key={location}
                  label={countryLabel(location)}
                  count={count}
                  total={totalLocations}
                  color="bg-success-500"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Leads per day chart ── */}
      {leadsData.some(d => d.value > 0) && (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Leads over time
            </h2>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={leadsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={period === '7d' ? 0 : 4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Recent leads table ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent leads
          </h2>
          <span className="text-xs text-slate-400">
            {recentLeads.length} total
          </span>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 mb-1">No leads yet</p>
            <p className="text-xs text-slate-400">
              When someone fills your contact form, they appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeads.map(lead => (
              <button
                key={lead.id}
                onClick={() => setSelectedLead(
                  selectedLead?.id === lead.id ? null : lead
                )}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {lead.name[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {lead.name}
                      </span>
                      {lead.company && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Building2 className="w-3 h-3" />
                          {lead.company}
                        </span>
                      )}
                      {lead.notified && (
                        <span className="text-[10px] bg-success-50 text-success-600 px-1.5 py-0.5 rounded font-medium">
                          Notified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{lead.email}</p>
                    {selectedLead?.id !== lead.id && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {lead.message}
                      </p>
                    )}

                    {/* Expanded message */}
                    {selectedLead?.id === lead.id && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {lead.message}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Reply to {lead.name.split(' ')[0]}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time + source */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-slate-400 justify-end">
                      <Clock className="w-3 h-3" />
                      {timeAgo(lead.createdAt)}
                    </div>
                    {lead.source && (
                      <p className="text-[10px] text-slate-300 mt-0.5">{lead.source}</p>
                    )}
                    <ChevronRight className={cn(
                      'w-4 h-4 text-slate-300 mt-1 ml-auto transition-transform',
                      selectedLead?.id === lead.id && 'rotate-90'
                    )} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Conversion rate ── */}
      {stats.totalViews > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Performance summary
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900 font-display">
                {stats.totalViews > 0
                  ? `${((stats.totalLeads / stats.totalViews) * 100).toFixed(1)}%`
                  : '—'
                }
              </p>
              <p className="text-xs text-slate-500 mt-1">Conversion rate</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Views → leads</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900 font-display">
                {stats.viewsLast30}
              </p>
              <p className="text-xs text-slate-500 mt-1">Views this month</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{stats.viewsLast7} this week</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900 font-display">
                {stats.leadsLast30}
              </p>
              <p className="text-xs text-slate-500 mt-1">Leads this month</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{stats.leadsLast7} this week</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
