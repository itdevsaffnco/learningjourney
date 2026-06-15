/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.{js,jsx}',
    './resources/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#EC4899',
      },
    },
  },
  plugins: [],
}
