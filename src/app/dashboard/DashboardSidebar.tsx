'use client'


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn, initials, trialDaysLeft, formatINR } from '@/lib/utils'
import {
  LayoutDashboard,
  User,
  BarChart2,
  Share2,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: User,
    desc: 'Build your rate card',
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart2,
    desc: 'Views & leads',
  },
  {
    href: '/dashboard/share',
    label: 'Share Kit',
    icon: Share2,
    desc: '6 channel templates',
  },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: CreditCard,
    desc: 'Plan & payments',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    desc: 'Account & notifications',
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    subscription: {
      plan: string
      status: string
      trialEndsAt: Date | null
    } | null
  }
  profile: {
    slug: string
    isPublished: boolean
    displayName: string
    totalViews: number
    totalLeads: number
  } | null
}

// ─── Nav link ─────────────────────────────────────────────────────────────────
function NavItem({
  item,
  pathname,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0]
  pathname: string
  onClick?: () => void
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
        isActive
          ? 'bg-brand-50 text-brand-700 shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <item.icon
        className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
        )}
      />
      <span className="flex-1">{item.label}</span>
      {isActive && (
        <ChevronRight className="w-3 h-3 text-brand-400" />
      )}
    </Link>
  )
}

// ─── Sidebar inner content (shared between desktop + mobile) ──────────────────
function SidebarContent({
  user,
  profile,
  pathname,
  onNavClick,
}: SidebarProps & { pathname: string; onNavClick?: () => void }) {
  const daysLeft = trialDaysLeft(user.subscription?.trialEndsAt ?? null)
  const isTrialing = user.subscription?.status === 'TRIAL'
  const isPro = user.subscription?.status === 'ACTIVE'
  const trialExpiringSoon = isTrialing && daysLeft <= 7

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="px-4 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold text-brand-600 font-display group-hover:text-brand-700 transition-colors">
            Talrat
          </span>
        </Link>
      </div>

      {/* ── Profile quick card ── */}
      {profile ? (
        <div className="mx-3 mt-4 mb-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="avatar w-8 h-8 text-xs">
              {initials(profile.displayName || user.name || 'T')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {profile.displayName || user.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                talrat.com/{profile.slug}
              </p>
            </div>
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
              title="View public profile"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-3 text-[10px] text-slate-500">
            <span><strong className="text-slate-900">{profile.totalViews}</strong> views</span>
            <span><strong className="text-slate-900">{profile.totalLeads}</strong> leads</span>
            <span className={cn(
              'ml-auto font-medium',
              profile.isPublished ? 'text-success-600' : 'text-warning-600'
            )}>
              {profile.isPublished ? '● Live' : '● Draft'}
            </span>
          </div>
        </div>
      ) : (
        <div className="mx-3 mt-4 mb-2">
          <Link
            href="/dashboard/profile"
            onClick={onNavClick}
            className="flex items-center gap-2 p-3 bg-brand-50 border border-brand-100 rounded-xl hover:bg-brand-100 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-brand-800">Create your profile</p>
              <p className="text-[10px] text-brand-500">Takes 5 minutes</p>
            </div>
            <ChevronRight className="w-3 h-3 text-brand-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onNavClick}
          />
        ))}

        {/* Admin link — only for admins */}
        {user.role === 'ADMIN' && (
          <>
            <div className="my-2 border-t border-slate-100" />
            <Link
              href="/admin"
              onClick={onNavClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <BarChart2 className="w-4 h-4 text-slate-400" />
              Admin Panel
              <span className="ml-auto text-[10px] bg-danger-100 text-danger-600 px-1.5 py-0.5 rounded font-semibold">
                ADMIN
              </span>
            </Link>
          </>
        )}
      </nav>

      {/* ── Trial / upgrade banner ── */}
      {isTrialing && (
        <div className={cn(
          'mx-3 mb-3 p-3 rounded-xl border',
          trialExpiringSoon
            ? 'bg-danger-50 border-danger-200'
            : 'bg-brand-50 border-brand-100'
        )}>
          {trialExpiringSoon && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-3 h-3 text-danger-500" />
              <span className="text-[10px] font-semibold text-danger-600 uppercase tracking-wide">
                Trial expiring
              </span>
            </div>
          )}
          <p className="text-xs font-semibold text-slate-900 mb-0.5">
            {daysLeft > 0 ? `${daysLeft} days left` : 'Trial ended'}
          </p>
          <p className="text-[10px] text-slate-500 mb-2">
            Upgrade to keep your profile live
          </p>
          <Link
            href="/dashboard/billing"
            onClick={onNavClick}
            className="block w-full text-center text-xs font-semibold bg-brand-600 text-white py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Upgrade — ₹499/mo
          </Link>
        </div>
      )}

      {isPro && (
        <div className="mx-3 mb-3 px-3 py-2 bg-success-50 border border-success-200 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
            <span className="text-xs font-semibold text-success-700">PRO Plan active</span>
          </div>
        </div>
      )}

      {/* ── User + sign out ── */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 mb-2">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="avatar w-8 h-8 text-xs">
              {initials(user.name || user.email)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user.name || 'Talent'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}

// ─── Main sidebar component ───────────────────────────────────────────────────
export function DashboardSidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white border-r border-slate-200 z-30">
        <SidebarContent
          user={user}
          profile={profile}
          pathname={pathname}
        />
      </aside>

      {/* ── Mobile: hamburger trigger is in the header ── */}
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 lg:hidden flex flex-col transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>

        <SidebarContent
          user={user}
          profile={profile}
          pathname={pathname}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>

      {/* Mobile open button — exposed via window event */}
      <button
        id="sidebar-mobile-trigger"
        onClick={() => setMobileOpen(true)}
        className="hidden"
        aria-label="Open menu"
      />
    </>
  )
}
