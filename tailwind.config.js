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
        'custom-bg': '#ffffff',
        'custom-fg': '#1a1a1a',
        'custom-muted': '#666666',
        'custom-accent': '#0066cc',
        'custom-card-bg': '#f8f9fa',
        'custom-border': '#e0e0e0',
      }
    },
  },
  plugins: [],
} 