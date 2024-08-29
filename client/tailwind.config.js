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
          lightest: '#d0f7d4',
          light: '#39B645',
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
        },
        accent: {
          DEFAULT: '#FFFFFF',
        },
      },
      fontFamily: {
        custom: ['Roboto', 'sans-serif'],
        title: ['Quicksand', 'sans-serif']
      },
      margin: {
        '1/2': '50%',
      },
      textShadow: {
        'default': '2px 2px 4px rgba(0, 0, 0, 0.5)',
        'md': '3px 3px 6px rgba(0, 0, 0, 0.3)',
        'lg': '4px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      width: {
        '2/5': '40%',
        '3/20': '15%',
        '1/20': '5%',
        '9/20': '45%'
      },
      screens: {
        'breakpoint-1000': '1000px',
        'breakpoint-800': '800px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-md': {
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
        },
        '.text-shadow-lg': {
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)',
        },
      });
    },
  ],
}

