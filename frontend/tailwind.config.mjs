/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#FF8FAB',
        'brand-navy': '#0F172A',
        'brand-pink-soft': '#FF8FAB15',
      },
    },
  },
  plugins: [],
}