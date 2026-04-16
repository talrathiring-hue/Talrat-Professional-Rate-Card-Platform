/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Prisma needs this to work in Next.js server components ───────────────
  // Without this, Prisma client cannot find its engine files
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // ── Security headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      { source: '/home',     destination: '/',              permanent: true },
      { source: '/login',    destination: '/auth/login',    permanent: true },
      { source: '/signup',   destination: '/auth/register', permanent: true },
      { source: '/register', destination: '/auth/register', permanent: true },
      { source: '/sign-in',  destination: '/auth/login',    permanent: true },
    ]
  },
}

module.exports = nextConfig
