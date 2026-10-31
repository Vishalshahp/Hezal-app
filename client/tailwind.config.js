/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Approved Hezal Market Palette
        primary: {
          50: '#F2F9F4',
          100: '#EDF7EF', // Soft green surface
          200: '#D1EAD7',
          300: '#A3D5AF',
          400: '#64B979',
          500: '#22C55E', // Fresh green accent
          600: '#16803D', // Primary green
          700: '#156F35',
          800: '#14532D', // Deep forest green
          900: '#0E3B20',
          950: '#082213',
        },
        brand: {
          bg: '#FAFAF5',       // Warm off-white background
          surface: '#FFFFFF',  // White surfaces
          soft: '#EDF7EF',     // Soft green surface
          forest: '#14532D',   // Deep forest green
          primary: '#16803D',  // Primary green
          accent: '#22C55E',   // Fresh green accent
          border: '#E5EAE5',   // Subtle borders
          text: '#17231D',     // Primary text
          muted: '#647067',    // Secondary text
        },
        surface: {
          card: '#FFFFFF',
          bg: '#FAFAF5',
          subtle: '#F4F5F0',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 83, 45, 0.04), 0 1px 2px -1px rgba(20, 83, 45, 0.04)',
        'card': '0 2px 8px -2px rgba(20, 83, 45, 0.06), 0 1px 4px -1px rgba(20, 83, 45, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(20, 83, 45, 0.08), 0 8px 10px -6px rgba(20, 83, 45, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
