/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#090d16',
          900: '#0f172a',
          850: '#152138',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          navy: '#1e3a8a',
          accent: '#f59e0b', // warm amber for pending/alerts
          accentHover: '#d97706',
          danger: '#ef4444',
          success: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
