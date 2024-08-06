/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#047500',
          dark: '#045401',
        },
        secondary: {
          DEFAULT: '#85008a',
          dark: '#510154',
        },
        input: {
          DEFAULT: '#f4f7f2',
          dark: '#e4e6e3',
        },
        background: {
          DEFAULT: '#242424',
          dark: '#171717'
        }
      },
      margin: {
        '1/2': '50%',
      },
    },
  },
  plugins: [],
}

