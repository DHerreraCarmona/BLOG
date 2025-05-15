module.exports = {
  content: [
    "./src/**/*.{html,ts,js,jsx,tsx}",
    "./src/**/*.component.{html,ts}",
    "./src/app/**/*.{html,ts}",
    "./src/app/shared/**/*.{html,ts}"
  ],
  safelist: [
    'bg-success-700', 'hover:bg-success-800', 'focus:ring-success-300',
    'bg-primary-700', 'hover:bg-primary-800', 'focus:ring-primary-300',
    'bg-danger-700', 'hover:bg-danger-800', 'focus:ring-danger-300',
    'bg-sky-700', 'hover:bg-sky-800', 'focus:ring-sky-300',
    'bg-gray-200', 'hover:bg-gray-500', 'focus:ring-gray-50',
    'text-white', 'text-gray-700'
  ],
  theme: {
    extend: {
      colors: {
        success: {
          300: "#4caf50",
          700: "#2e7d32",
          800: "#1b5e20", 
        },
        primary: {
          300: "#0d47a1",
          700: "#1976d2",
          800: "#1565c0",
        },
        danger: {
          300: "#d32f2f",
          700: "#d32f2f",
          800: "#c62828",
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}