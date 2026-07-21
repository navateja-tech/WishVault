/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF0F6',
          100: '#FBCFE8',
          200: '#F9A8D4',
          300: '#F472B6',
          400: '#EC4899',
          500: '#DB2777',
          600: '#BE185D',
          DEFAULT: '#F472B6',
          dark: '#EC4899',
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#FFF7FA',
          tertiary: '#FFF0F6',
        },
        surface: {
          card: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
          inverse: '#FFFFFF',
          link: '#EC4899',
        },
        border: {
          light: '#F3F4F6',
          default: '#E5E7EB',
          dark: '#D1D5DB',
        },
      },
      fontFamily: {
        inter: ["Inter"],
      },
    },
  },
  plugins: [],
}
