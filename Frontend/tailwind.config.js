/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5FBF7',
          100: '#ECFDF5',
          200: '#D1FAE5',
          300: '#A7F3D0',
          400: '#34D399',
          500: '#10B981',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        primary: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          light: '#ECFDF5',
          dark: '#15803D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F5FBF7',
          mint: '#ECFDF5',
          border: '#E2EAE4',
        },
        ink: {
          DEFAULT: '#17211B',
          muted: '#647067',
          faint: '#94A399',
        },
        status: {
          warning: '#D97706',
          error: '#DC2626',
          success: '#15803D',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(23, 33, 27, 0.05), 0 1px 2px -1px rgba(23, 33, 27, 0.05)',
        card: '0 4px 6px -1px rgba(23, 33, 27, 0.04), 0 2px 4px -2px rgba(23, 33, 27, 0.04)',
        elevated: '0 10px 15px -3px rgba(23, 33, 27, 0.08), 0 4px 6px -4px rgba(23, 33, 27, 0.04)',
        glow: '0 0 20px -3px rgba(16, 185, 129, 0.25)',
      },
    },
  },
  plugins: [],
}
