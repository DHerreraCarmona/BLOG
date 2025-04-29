/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    {
      pattern: /bg-success-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /focus:ring-success-(100|200|300|400|500|600|700|800|900)/,
    }
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
  ],
}
