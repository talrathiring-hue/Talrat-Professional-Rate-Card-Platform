import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardSidebar } from '@/app/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/app/dashboard/DashboardHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s — talrat',
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  // Fetch profile completion for sidebar badge
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      slug: true,
      isPublished: true,
      displayName: true,
      totalViews: true,
      totalLeads: true,
    },
  })

  const user = {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    image: session.user.image ?? null,
    role: session.user.role,
    subscription: session.user.subscription,
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar (desktop) ── */}
      <DashboardSidebar user={user} profile={profile} />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* ── Top header ── */}
        <DashboardHeader user={user} profile={profile} />

        {/* ── Page content ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>
    </div>
  )
}
