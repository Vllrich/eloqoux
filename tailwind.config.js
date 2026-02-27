/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#f4ede4',
          dark: '#1a1714',
        },
        surface: {
          DEFAULT: '#fffdf7',
          dark: '#242018',
        },
        text: {
          DEFAULT: '#2c2418',
          muted: '#7a6e5d',
          'muted-dark': '#9a8e7e',
          dark: '#e8e0d0',
        },
        border: {
          DEFAULT: '#d9cdb8',
          dark: '#3a3228',
        },
        accent: {
          DEFAULT: '#8b6914',
          dark: '#c9a84c',
        },
      },
      fontFamily: {
        serif: ['LibreBaskerville_400Regular', 'Georgia', 'serif'],
        'serif-bold': ['LibreBaskerville_700Bold', 'Georgia', 'serif'],
        'serif-italic': ['LibreBaskerville_400Regular_Italic', 'Georgia', 'serif'],
        sans: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        'sans-medium': ['Inter_500Medium', 'system-ui', 'sans-serif'],
        'sans-semibold': ['Inter_600SemiBold', 'system-ui', 'sans-serif'],
        'sans-bold': ['Inter_700Bold', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
