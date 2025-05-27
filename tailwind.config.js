/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.{html,md}",
    "./themes/**/layouts/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'custom-bg': '#0f172a',
        'custom-fg': '#e2e8f0',
        'custom-muted': '#94a3b8',
        'custom-accent': '#3b82f6',
        'custom-card-bg': '#1e293b',
        'custom-border': '#334155',
      }
    },
  },
  plugins: [],
} 