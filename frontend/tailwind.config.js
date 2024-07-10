/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  content: [],
  theme: {
    extend: {
      width: {
        'custom-1900': '1900px',
      },
      height: {
        'custom-900': '900px',
      },
      fontSize: {
        'xxs': '0.625rem', // Custom text size (10px)
      }
    },
  },
  plugins: [require('daisyui')],

}

