/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Legacy app tokens → forest + sand */
        'upwork-green': '#064e3b',
        'upwork-green-d': '#022c22',
        'upwork-green-l': '#e6f2ed',
        'upwork-green-xl': '#f0f6f3',
        danger: '#b91c1c',
        ink: '#0c1917',
        ivory: {
          DEFAULT: '#faf6f1',
        },
        page: {
          DEFAULT: '#f9f9f7',
        },
        section: {
          DEFAULT: '#ede9e0',
        },
        paper: {
          DEFAULT: '#f3ebe0',
        },
        saffron: {
          DEFAULT: '#b8954a',
        },
        /* Brand accent scale anchored on #064E3B */
        emerald2: {
          50: '#f0f6f3',
          100: '#dceee6',
          200: '#b8d4c6',
          300: '#84b39c',
          400: '#5cba94',
          500: '#0d9488',
          600: '#064e3b',
          700: '#054a3a',
          800: '#043d31',
          900: '#022c22',
        },
        gray: {
          75: '#f5f1eb',
          150: '#e5dcd0',
        },
        green: {
          DEFAULT: '#064e3b',
          dark: '#022c22',
          light: '#e6f2ed',
          mid: '#b8d4c6',
        },
        forest: {
          DEFAULT: '#0f3428',
          deep: '#071a14',
          surface: '#153d30',
        },
        brand: {
          dark: '#0c1917',
          mid: '#3d524c',
          light: '#5c6f69',
          border: '#e5dcd0',
          alt: '#fdf8f4',
          'bg-green': '#ecf4f1',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        landing: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Figtree', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
      maxWidth: {
        content: '1160px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(6, 78, 59, 0.05), 0 1px 3px rgba(12, 25, 23, 0.06)',
        md: '0 4px 16px rgba(12, 25, 23, 0.08)',
        lg: '0 12px 40px rgba(12, 25, 23, 0.1)',
        forest: '0 0 0 3px rgba(6, 78, 59, 0.12)',
        card: '0 1px 3px rgba(12, 25, 23, 0.06), 0 1px 2px rgba(6, 78, 59, 0.04)',
        'card-hover': '0 8px 28px rgba(12, 25, 23, 0.1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
