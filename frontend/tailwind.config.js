/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Woodworking aesthetic colors
        wood: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        sawdust: {
          light: '#f5e6d3',
          DEFAULT: '#d4a574',
          dark: '#8b6f47',
        },
        coffee: {
          light: '#8d6e63',
          DEFAULT: '#5d4037',
          dark: '#3e2723',
        },
      },
    },
  },
  plugins: [],
}
