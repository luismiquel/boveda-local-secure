/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0a',
          surface: '#121212',
          border: '#1f1f1f',
          accent: '#3b82f6'
        }
      }
    },
  },
  plugins: [],
}
