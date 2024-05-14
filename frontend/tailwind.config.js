/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  content: [],
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.625rem', // Custom text size (10px)
      }
    },
  },
  plugins: [require('daisyui')],

}

