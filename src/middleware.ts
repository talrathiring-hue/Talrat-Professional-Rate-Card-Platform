
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  // With JWT strategy, req.auth contains the decoded JWT token
  const session = req.auth
  const isLoggedIn = !!session?.user
  const isAdmin    = session?.user?.role === 'ADMIN'
  const path       = nextUrl.pathname

  const isDashboard = path.startsWith('/dashboard')
  const isAdminRoute = path.startsWith('/admin')
  const isAuthRoute  = path.startsWith('/auth')

  // ── Dashboard: must be logged in 
  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // ── Admin: must have ADMIN role ───────────────────────────────────────────
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', nextUrl))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  // ── Auth pages: redirect to dashboard if already logged in ────────────────
  if (isAuthRoute && isLoggedIn) {
    if (path === '/auth/verify' || path === '/auth/error') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
}
