module.exports = {
  content: [
    "./src/**/*.{html,ts,js,jsx,tsx}",
    "./src/**/*.component.{html,ts}",
    "./src/app/**/*.{html,ts}",
    "./src/app/shared/**/*.{html,ts}"
  ],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/typography')],
}
