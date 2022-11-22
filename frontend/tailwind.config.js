const colors = require('tailwindcss/colors')

console.log(Object.keys(colors).sort())

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./pages/**/*.{html,js}"
  ],
  safelist: [
    'justify-center',
    'items-center',
    'p-5',
    'rounded',
    'h-24',
    {
      pattern: /./
    }
  ],
  theme: {
    extend: {
      colors: {
        amber: colors.amber,
      }
    },
  },
  plugins: [],
}
