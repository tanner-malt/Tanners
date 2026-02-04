/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.{html,md}",
    "./themes/**/layouts/**/*.html",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        'custom-bg': '#0f0f1a',
        'custom-fg': '#f0f0f5',
        'custom-muted': '#9ca3af',
        'custom-accent': '#a855f7',
        'custom-accent-secondary': '#ec4899',
        'custom-accent-tertiary': '#f97316',
        'custom-card-bg': 'rgba(30, 30, 50, 0.8)',
        'custom-border': 'rgba(168, 85, 247, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} 