/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f8fafc',
          dark: '#09090b',
        },
        surface: {
          light: '#ffffff',
          dark: '#121215',
        },
        border: {
          light: '#e2e8f0',
          dark: '#27272a',
        },
        primary: {
          DEFAULT: '#0f172a',
          dark: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
