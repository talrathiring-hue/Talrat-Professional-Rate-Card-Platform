
// Admin panel shell — guards ADMIN role, dark sidebar, breadcrumb header
// Any non-ADMIN hitting /admin/* gets redirected to /dashboard

import { auth }       from '@/lib/auth'
import { redirect }   from 'next/navigation'
import Link           from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — talrat Admin' },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user)              redirect('/auth/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── Dark sidebar ── */}
      <AdminSidebar />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">

        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <Link href="/admin" className="lg:hidden text-white font-bold text-base font-display">
              talrat <span className="text-red-400 text-xs font-semibold ml-1 bg-red-500/20 px-1.5 py-0.5 rounded">ADMIN</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              ← Back to dashboard
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
