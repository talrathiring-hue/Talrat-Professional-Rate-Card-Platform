// src/lib/auth.ts
// FIXED:
// 1. Resend 'from' address uses onboarding@resend.dev by default (the only
//    address that works without a verified domain in Resend)
// 2. Clean session callback with no edge-runtime issues

import NextAuth             from 'next-auth'
import { PrismaAdapter }    from '@auth/prisma-adapter'
import Google               from 'next-auth/providers/google'
import Resend               from 'next-auth/providers/resend'
import { prisma }           from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // ── FIXED: 'from' must be onboarding@resend.dev until you verify a domain ──
    // 'talrat@resend.dev' does not exist → Resend rejects it → magic link fails
    // Once you verify talrat.com at resend.com/domains, change this to:
    // from: 'hello@talrat.com'
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from:   'onboarding@resend.dev',   // ← FIXED (was using env var that had wrong value)
      name:   'talrat',
    }),
  ],

  pages: {
    signIn:        '/auth/login',
    newUser:       '/dashboard',
    error:         '/auth/error',
    verifyRequest: '/auth/verify',
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as any).role ?? 'TALENT'
      }
      return token
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id        = token.sub!
        session.user.role      = (token.role as any) ?? 'TALENT'
        session.user.isBlocked = (token.isBlocked as any) ?? false
      }

      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where:  { id: token.sub },
            select: {
              role:          true,
              isBlocked:     true,
              subscription:  { select: { plan: true, status: true, trialEndsAt: true } },
              profile:       { select: { slug: true, isPublished: true } },
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

    async signIn({ user }) {
      if (!user.email) return false
      try {
        const dbUser = await prisma.user.findUnique({
          where:  { email: user.email },
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
    async createUser({ user }) {
      if (!user.id) return

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
            whatsappOnLead: true,   // ← changed to true so WhatsApp works immediately
            weeklyDigest:   true,
          },
        }),
      ])

      if (user.email && user.name) {
        sendWelcomeEmail(user.email, user.name).catch(e => {
          console.error('Failed to send welcome email:', e)
        })
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
})
