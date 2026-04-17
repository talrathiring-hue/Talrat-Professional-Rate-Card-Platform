/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Prisma + server components ───────────────────────────────────────────
  // Tell Next.js to bundle these packages for server components
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },

  // ── a ───────────────────────────────────────────────────────────────
  // Allow images from these external domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },   // Google avatars
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // GitHub avatars
      { protocol: 'https', hostname: '*.supabase.co' },                 // Supabase storage
    ],
  },

  // ── Security headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Block embedding in iframes
          { key: 'X-Frame-Options',        value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer info
          { key: 'Referrer-Policy',        value: 'origin-when-cross-origin' },
          // Disable unnecessary browser features
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
