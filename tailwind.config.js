/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#fdfcf8',
          100: '#f8f6f0',
          200: '#f1ede0',
          300: '#e6ddd0',
          400: '#d6c7b3',
          500: '#c4b199',
          600: '#b09b80',
          700: '#9a8569',
          800: '#7c6b55',
          900: '#645645',
          950: '#342e25'
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf4e8',
          300: '#f5ebcf',
          400: '#eeddb1',
          500: '#e5cc8f',
          600: '#d9b86b',
          700: '#cb9f4c',
          800: '#b8853f',
          900: '#956c35',
          950: '#533a1b'
        },
        latte: {
          50: '#faf9f7',
          100: '#f3f0eb',
          200: '#e7dfd4',
          300: '#d7c9b8',
          400: '#c4ad94',
          500: '#b5977a',
          600: '#a8856a',
          700: '#8c6d59',
          800: '#735a4c',
          900: '#5e4a3f',
          950: '#322620'
        }
      },
      backgroundImage: {
        'elegant-gradient': 'linear-gradient(135deg, #f8f6f0 0%, #e6ddd0 50%, #d6c7b3 100%)',
        'warm-gradient': 'linear-gradient(135deg, #fdf9f3 0%, #f5ebcf 50%, #e5cc8f 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #faf9f7 0%, #d7c9b8 50%, #b5977a 100%)'
      }
    },
  },
  plugins: [],
};
