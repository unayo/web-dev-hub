/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        'apple-silver-bg': '#f5f5f7',
        'apple-card': '#ffffff',
        'apple-text-primary': '#1d1d1f',
        'apple-text-secondary': '#86868b',
        'apple-border': 'rgba(0, 0, 0, 0.05)',
        'apple-blue': '#0066cc'
      }
    },
  },
  plugins: [],
}