import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Talrat brand — LinkedIn blue
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b9fc',
          400: '#8193f8',
          500: '#5f72f1',
          600: '#0a66c2',   // primary LinkedIn blue
          700: '#084fa3',
          800: '#063b80',
          900: '#042a5e',
          950: '#021540',
        },
        navy: {
          50:  '#f0f4f8',
          100: '#d9e4f0',
          200: '#b0c9e3',
          300: '#7aa5ce',
          400: '#4a80b5',
          500: '#2563a8',
          600: '#1e4f8c',
          700: '#183d6e',
          800: '#122d52',
          900: '#0c1f38',
          950: '#060f1c',
        },
        success: {
          50:  '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50:  '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50:  '#fff1f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem',  { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg':  ['3rem',    { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md':  ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-sm':  ['1.875rem',{ lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)',
        'modal':      '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        'brand':      '0 4px 20px rgba(10,102,194,0.25)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease both',
        'fade-in':    'fadeIn 0.3s ease',
        'slide-in':   'slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      backgroundImage: {
        'hero-grid': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230a66c2' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-brand': 'linear-gradient(135deg, #0a66c2 0%, #0a3d80 100%)',
        'gradient-dark':  'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
