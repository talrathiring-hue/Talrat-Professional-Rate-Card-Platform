'use client'
// src/components/admin/AdminSidebar.tsx

import Link           from 'next/link'
import { usePathname } from 'next/navigation'
import { cn }          from '@/lib/utils'
import {
  LayoutDashboard, Users, HelpCircle,
  BarChart2, Settings, Shield,
} from 'lucide-react'

const NAV = [
  { href: '/admin',         label: 'Overview',    icon: LayoutDashboard, exact: true  },
  { href: '/admin/users',   label: 'Users',       icon: Users,           exact: false },
  { href: '/admin/tickets', label: 'Tickets',     icon: HelpCircle,      exact: false },
]

export function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-56 lg:flex-col bg-slate-900 border-r border-slate-800 z-30">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg font-display">talrat</span>
          <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
            Admin
          </span>
        </div>
        <p className="text-slate-500 text-xs mt-1">Control panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-brand-400' : 'text-slate-500')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-2 px-3 py-2">
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs text-slate-500">Admin access only</span>
        </div>
      </div>
    </aside>
  )
}
