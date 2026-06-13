/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#D4AF37',
        'brand-cream': '#FFFDD0',
        'brand-black': '#111111',
        'brand-white': '#FFFFFF',
        'brand-rose': '#B07A85',
        'brand-rose-hover': '#9E6A75',
        'brand-cream-bg': '#FCF8F5',
        'brand-search': '#2B7FFF',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Outfit', 'sans-serif'],
        serif: ['"Belgant Aesthetic"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
