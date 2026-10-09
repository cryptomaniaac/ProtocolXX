/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#F5F4F2',
          dark: '#111110',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1C1C1A',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#6B7280',
          dark: '#F0EFEB',
          'muted-dark': '#9CA3AF',
        },
        primary: {
          DEFAULT: '#1A6B6B',
          hover: '#145555',
          dark: '#2D9B9B',
        },
        accent: '#C96A2E',
        border: {
          DEFAULT: '#E5E3DF',
          dark: '#2E2E2B',
        },
        highlight: {
          DEFAULT: '#E6F0F0',
          dark: '#1A3535',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        '2xl': '64px',
      },
    },
  },
  plugins: [],
};
