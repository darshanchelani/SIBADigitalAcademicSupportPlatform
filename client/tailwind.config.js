/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F7F8EF',
          100: '#EEF1DD',
          200: '#DCE2BB',
          300: '#C0C78C',
          400: '#B3BE82',
          500: '#A6B37D',
          600: '#8A9866',
          700: '#6D7A52',
          800: '#535D3E',
          900: '#3B422B',
          950: '#1F2315',
        },
        accent: {
          50: '#FAF3EB',
          100: '#F3E5D1',
          200: '#E6CAA6',
          300: '#D6B084',
          400: '#C8A176',
          500: '#B99470',
          600: '#A37F5D',
          700: '#82644A',
          800: '#5F4937',
          900: '#3E2F23',
        },
        surface: {
          50: '#FEFAE0',
          100: '#F5EBCD',
          200: '#E8DCB5',
          300: '#D4C79D',
          400: '#A89C72',
          500: '#7E724E',
          600: '#5C532F',
          700: '#3F3A22',
          800: '#2B2817',
          900: '#18160C',
        },
        cream: '#FEFAE0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
      },
      lineHeight: {
        relaxed: '1.6',
        loose: '1.75',
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(63, 58, 34, 0.04), 0 1px 3px rgba(63, 58, 34, 0.03)',
        'card-hover': '0 4px 12px rgba(63, 58, 34, 0.06)',
        soft: '0 2px 8px rgba(63, 58, 34, 0.05)',
        lift: '0 8px 24px rgba(63, 58, 34, 0.08)',
      },
    },
  },
  plugins: [],
};
