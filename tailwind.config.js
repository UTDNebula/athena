/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        haiti: '#090b2c', // brand black
        persimmon: {
          50: '#ffe5de',
          100: '#ffcabd',
          200: '#ffb09d',
          300: '#ff947e',
          400: '#ff7760',
          500: '#ff5743', // brand accent, danger
          600: '#d14a39',
          700: '#a43d2e',
          800: '#793025',
          900: '#51231b',
        },
        royal: '#573dff', // brand secondary (dark)
        royalDark: '#3c2ab2',
        cornflower: {
          50: '#eae4ff',
          100: '#d3caff', // ~periwinkle
          200: '#bcb0fe',
          300: '#a297fd',
          400: '#857efc',
          500: '#6266fa', // brand primary
          600: '#5455cc',
          700: '#45449f', // ~royal
          800: '#363475',
          900: '#28254d',
        },
        periwinkle: '#c2c8ff', // brand secondary (light)
        shade: '#101828', // drop shadow color from shipfaster ui
      },
      fontSize: {
        headline1: [
          '96px',
          {
            letterSpacing: '-1.5px',
          },
        ],
        headline2: [
          '60px',
          {
            letterSpacing: '-0.5px',
          },
        ],
        headline3: [
          '48px',
          {
            letterSpacing: '0px',
          },
        ],
        headline4: [
          '34px',
          {
            letterSpacing: '0.25px',
          },
        ],

        headline5: [
          '24px',
          {
            letterSpacing: '0px',
          },
        ],

        headline6: [
          '20px',
          {
            letterSpacing: '0.15px',
          },
        ],
        subtitle1: [
          '16px',
          {
            letterSpacing: '0.15px',
          },
        ],
        subtitle2: [
          '14px',
          {
            letterSpacing: '0.1px',
          },
        ],
        body1: [
          '16px',
          {
            letterSpacing: '0.5px',
          },
        ],
        body2: [
          '14px',
          {
            letterSpacing: '0.25px',
          },
        ],
        button: [
          '14px',
          {
            letterSpacing: '1.25px',
          },
        ],
        caption: [
          '12px',
          {
            letterSpacing: '0.4px',
          },
        ],
        overline: [
          '10px',
          {
            letterSpacing: '1.5px',
          },
        ],
      },
      keyframes: {
        fadeIn: {
          '0%': { transform: 'translateX(1rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '100' },
        },
      },
      animation: {
        intro: 'fadeIn 0.75s ease-in-out',
      },
      gridTemplateColumns: {
        onboardingHonors: '40px minmax(0, 1fr)',
      },
      fontFamily: {
        kallisto: ['var(--font-kallisto)', 'Roboto', 'sans-serif'],
        inter: ['var(--font-inter)', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
