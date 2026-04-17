
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id:          string
      role:        'TALENT' | 'ADMIN'
      isBlocked:   boolean
      subscription: {
        plan:        'FREE_TRIAL' | 'PRO'
        status:      'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
        trialEndsAt: Date | null
      } | null
      profile: {
        slug:        string
        isPublished: boolean
      } | null
    } & DefaultSession['user']
  }

  interface JWT {
    id?:        string
    role?:      string
    isBlocked?: boolean
  }
}
