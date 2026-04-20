// Just re export the handlers from auth.ts

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers

// Required for Vercel — tells Next.js this is a dynamic route
// and prevents it from trying to statically generate it at build time
export const dynamic = 'force-dynamic'
