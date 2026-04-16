// src/lib/auth.ts
// FIXED: Split auth config so Prisma only runs in Node.js runtime
// The middleware uses auth() from this file but we tell NextAuth
// to use JWT for the middleware check — NOT the Prisma adapter

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
   adapter:
  process.env.NODE_ENV === "production"
    ? PrismaAdapter(prisma)
    : undefined,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      name: 'talrat',
    }),
  ],

  pages: {
    signIn:        '/auth/login',
    newUser:       '/dashboard',
    error:         '/auth/error',
    verifyRequest: '/auth/verify',
  },

  // ── CRITICAL FIX: Use JWT session strategy ────────────────────────────────
  // This allows the middleware to read the session using JWT (Edge-safe)
  // WITHOUT calling Prisma (which cannot run on Edge)
  session: {
    strategy: 'jwt',      // ← Changed from 'database' to 'jwt'
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    // JWT callback — runs when token is created or read
    // This is what the middleware reads — no Prisma needed here
    async jwt({ token, user, trigger }) {
      // On first sign in, attach user data to the JWT token
      if (user) {
        token.id   = user.id
        token.role = (user as any).role ?? 'TALENT'
      }

      // On subsequent requests, refresh role from DB occasionally
      // (only in Node.js context, not Edge)
      if (trigger === 'update' || !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub! },
            select: { role: true, isBlocked: true },
          })
          if (dbUser) {
            token.role      = dbUser.role
            token.isBlocked = dbUser.isBlocked
          }
        } catch {
          // Silently fail — middleware will use cached token value
        }
      }

      return token
    },

    // Session callback — attaches token data to the session object
    // Used by useSession() and auth() in server components
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id        = token.sub!
        session.user.role      = (token.role as any) ?? 'TALENT'
        session.user.isBlocked = (token.isBlocked as any) ?? false
      }

      // Fetch full user data from DB (only in Node.js, not Edge)
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              role: true,
              isBlocked: true,
              subscription: {
                select: { plan: true, status: true, trialEndsAt: true },
              },
              profile: {
                select: { slug: true, isPublished: true },
              },
            },
          })

          if (dbUser) {
            session.user.role         = dbUser.role
            session.user.isBlocked    = dbUser.isBlocked
            session.user.subscription = dbUser.subscription
            session.user.profile      = dbUser.profile
          }
        } catch {
          // Non-fatal — session still works with token data
        }
      }

      return session
    },

    // Block banned users
    async signIn({ user }) {
      if (!user.email) return false
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { isBlocked: true },
        })
        if (dbUser?.isBlocked) return false
      } catch {
        // Allow sign in if DB check fails
      }
      return true
    },
  },

  events: {
    // Auto-create subscription + notification prefs on first sign up
    async createUser({ user }) {
      if (!user.id) return
      try {
        await Promise.all([
          prisma.subscription.create({
            data: {
              userId:      user.id,
              plan:        'FREE_TRIAL',
              status:      'TRIAL',
              trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          }),
          prisma.notificationPrefs.create({
            data: {
              userId:         user.id,
              emailOnLead:    true,
              whatsappOnLead: false,
              weeklyDigest:   true,
            },
          }),
        ])
      } catch (e) {
        console.error('Failed to create user defaults:', e)
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
})
