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
          DEFAULT: '#fafaf6',
          dark: '#121212',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#161616',
        },
        text: {
          DEFAULT: '#121212',
          muted: '#444444',
          'muted-dark': '#b8b8b8',
          dark: '#ededed',
        },
        border: {
          DEFAULT: '#e6e6e0',
          dark: '#2a2a2a',
        },
        accent: {
          DEFAULT: '#2f6fed',
          dark: '#d9b827',
        },
      },
    },
  },
  plugins: [],
}

