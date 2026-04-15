import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Eye,
  Users,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Clock,
  ExternalLink,
  ChevronRight,
  Share2,
  BarChart2,
  User,
} from 'lucide-react'
import { formatINR, timeAgo, trialDaysLeft, cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

// Stat card
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  href?: string
}) {
  const content = (
    <div className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-4 h-4" />
        </div>
        {href && <ChevronRight className="w-4 h-4 text-slate-300" />}
      </div>
      <div className="text-2xl font-bold text-slate-900 font-display mb-0.5">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

//  Quick action card 
function ActionCard({
  href,
  icon: Icon,
  iconBg,
  title,
  desc,
  cta,
}: {
  href: string
  icon: React.ElementType
  iconBg: string
  title: string
  desc: string
  cta: string
}) {
  return (
    <Link
      href={href}
      className="card-hover p-5 flex items-start gap-4 group"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 mb-0.5">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
    </Link>
  )
}

//  Main page 
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = session.user.id

  // Fetch everything in parallel
  const [profile, recentLeads, thisMonthViews, thisMonthLeads] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: { take: 5, orderBy: { order: 'asc' } },
        workSamples: { take: 3, orderBy: { order: 'asc' } },
      },
    }),
    prisma.lead.findMany({
      where: { profile: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.analytics.count({
      where: {
        profile: { userId },
        event: 'PROFILE_VIEW',
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.lead.count({
      where: {
        profile: { userId },
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ])

  const { user } = session
  const daysLeft = trialDaysLeft(user.subscription?.trialEndsAt ?? null)
  const isTrialing = user.subscription?.status === 'TRIAL'
  const isPro = user.subscription?.status === 'ACTIVE'
  const firstName = user.name?.split(' ')[0] ?? 'there'

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Greeting ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {profile?.isPublished
            ? `Your profile is live at talrat.com/${profile.slug}`
            : "Let's get your rate card live today."}
        </p>
      </div>

      {/* ── Trial / upgrade banner ── */}
      {isTrialing && daysLeft <= 7 && (
        <div className="flex items-start gap-3 p-4 bg-danger-50 border border-danger-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger-800">
              {daysLeft === 0 ? 'Trial ended' : `Trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
            </p>
            <p className="text-xs text-danger-600 mt-0.5">
              Upgrade to PRO to keep your profile live and continue receiving leads.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex-shrink-0 text-xs font-semibold bg-danger-500 text-white px-3 py-1.5 rounded-lg hover:bg-danger-600 transition-colors"
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── No profile banner ── */}
      {!profile && (
        <div className="card p-6 bg-gradient-to-r from-brand-50 to-slate-50 border-brand-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900 mb-1">
                Create your rate card
              </h2>
              <p className="text-sm text-slate-500">
                It takes 5 minutes. Clients can start finding you immediately.
              </p>
            </div>
            <Link href="/dashboard/profile" className="btn-primary flex-shrink-0">
              Start now →
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total views"
          value={profile?.totalViews ?? 0}
          sub="All time"
          icon={Eye}
          color="bg-brand-50 text-brand-600"
          href="/dashboard/analytics"
        />
        <StatCard
          label="Total leads"
          value={profile?.totalLeads ?? 0}
          sub="All time"
          icon={Users}
          color="bg-success-50 text-success-600"
          href="/dashboard/analytics"
        />
        <StatCard
          label="Views this month"
          value={thisMonthViews}
          sub={new Date().toLocaleString('default', { month: 'long' })}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600"
          href="/dashboard/analytics"
        />
        <StatCard
          label="Leads this month"
          value={thisMonthLeads}
          sub={new Date().toLocaleString('default', { month: 'long' })}
          icon={Users}
          color="bg-warning-50 text-warning-600"
          href="/dashboard/analytics"
        />
      </div>

      {/* ── Two column layout ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Quick actions */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          <ActionCard
            href="/dashboard/profile"
            icon={User}
            iconBg="bg-brand-50 text-brand-600"
            title={profile ? 'Edit your profile' : 'Build your profile'}
            desc={profile ? 'Update your rate card, skills, or bio' : 'Set up your rate card in 5 minutes'}
            cta="Open builder"
          />
          <ActionCard
            href="/dashboard/share"
            icon={Share2}
            iconBg="bg-purple-50 text-purple-600"
            title="Share your profile"
            desc="6 ready-to-copy templates for LinkedIn, WhatsApp, email"
            cta="Get templates"
          />
          <ActionCard
            href="/dashboard/analytics"
            icon={BarChart2}
            iconBg="bg-success-50 text-success-600"
            title="View analytics"
            desc="See who viewed your profile and where they came from"
            cta="View analytics"
          />

          {/* Profile live link */}
          {profile?.isPublished && (
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors group"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="flex-1">talrat/{profile.slug}</span>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </a>
          )}
        </div>

        {/* Recent leads */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Recent leads</h2>
            <Link
              href="/dashboard/analytics"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">No leads yet</p>
              <p className="text-xs text-slate-400">
                Share your profile to start getting enquiries
              </p>
              <Link href="/dashboard/share" className="btn-secondary text-xs mt-4 inline-flex">
                Share your profile →
              </Link>
            </div>
          ) : (
            <div className="card divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="avatar w-9 h-9 text-xs flex-shrink-0">
                      {lead.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {lead.name}
                        </p>
                        {lead.company && (
                          <span className="badge badge-gray text-[10px] flex-shrink-0">
                            {lead.company}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {lead.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] text-slate-400">
                        {timeAgo(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
