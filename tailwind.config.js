/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F5F1',
        ink: '#161A23',
        line: '#DAD7CF',
        teal: {
          DEFAULT: '#0F9D8C',
          50: '#E7F7F5',
          100: '#CFEFEA',
          400: '#28B5A2',
          500: '#0F9D8C',
          600: '#0C7E70',
          700: '#0A6258',
        },
        coral: {
          DEFAULT: '#E5572A',
          50: '#FDEEE8',
          100: '#FAD9C9',
          400: '#EC7A53',
          500: '#E5572A',
          600: '#C3431C',
        },
        amber: {
          DEFAULT: '#F2A516',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'scan-grid':
          'linear-gradient(to right, #DAD7CF 1px, transparent 1px), linear-gradient(to bottom, #DAD7CF 1px, transparent 1px)',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dash-in': {
          '0%': { strokeDashoffset: 'var(--dash-start)' },
          '100%': { strokeDashoffset: 'var(--dash-end)' },
        },
      },
      animation: {
        scanline: 'scanline 1.8s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        'dash-in': 'dash-in 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards',
      },
    },
  },
  plugins: [],
};
