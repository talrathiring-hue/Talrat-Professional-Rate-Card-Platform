'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Bell, ExternalLink, ChevronRight } from 'lucide-react'
import { initials } from '@/lib/utils'

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, { title: string; desc: string }> = {
  '/dashboard':            { title: 'Dashboard',    desc: 'Your overview' },
  '/dashboard/profile':   { title: 'Profile',       desc: 'Build your rate card' },
  '/dashboard/analytics': { title: 'Analytics',     desc: 'Views, leads & sources' },
  '/dashboard/share':     { title: 'Share Kit',      desc: '6 channel templates' },
  '/dashboard/billing':   { title: 'Billing',        desc: 'Plan & payment history' },
  '/dashboard/settings':  { title: 'Settings',       desc: 'Account & notifications' },
}

interface HeaderProps {
  user: {
    name: string
    email: string
    image: string | null
    role: string
  }
  profile: {
    slug: string
    isPublished: boolean
  } | null
}

export function DashboardHeader({ user, profile }: HeaderProps) {
  const pathname = usePathname()
  const pageInfo = PAGE_TITLES[pathname] ?? { title: 'Dashboard', desc: '' }

  function openMobileSidebar() {
    document.getElementById('sidebar-mobile-trigger')?.click()
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center gap-4">

      {/* Mobile hamburger */}
      <button
        onClick={openMobileSidebar}
        className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="lg:hidden text-lg font-bold text-brand-600 font-display">
        Talrat
      </Link>

      {/* Page title — desktop */}
      <div className="hidden lg:flex items-center gap-2 flex-1">
        <h1 className="text-base font-semibold text-slate-900">{pageInfo.title}</h1>
        {pageInfo.desc && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-sm text-slate-400">{pageInfo.desc}</span>
          </>
        )}
      </div>

      <div className="flex-1 lg:flex-none" />

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* View profile link */}
        {profile?.isPublished && (
          <a
            href={`/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View profile
          </a>
        )}

        {/* Notification bell — placeholder for future */}
        <button
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User avatar */}
        <div className="flex items-center">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
            />
          ) : (
            <div className="avatar w-8 h-8 text-xs ring-2 ring-slate-200">
              {initials(user.name || user.email)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
