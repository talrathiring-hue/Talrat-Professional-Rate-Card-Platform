// src/app/api/auth/[...nextauth]/route.ts
// This single file handles ALL auth requests:
// - GET  /api/auth/session
// - POST /api/auth/signin
// - POST /api/auth/signout
// - GET  /api/auth/callback/google
// - POST /api/auth/signin/resend  (magic link)
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
