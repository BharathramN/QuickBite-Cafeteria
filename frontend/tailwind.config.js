/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Vibrant cafeteria amber-orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        veg: {
          DEFAULT: '#16a34a',
          light: '#dcfce7',
          dark: '#14532d',
        },
        nonVeg: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
          dark: '#7f1d1d',
        },
        coin: {
          DEFAULT: '#eab308',
          light: '#fef9c3',
          dark: '#854d0e',
        }
      },
    },
  },
  plugins: [],
}
