import type { Config } from 'tailwindcss';

const config: Config = {
  // [CORRECCIÓN CRÍTICA] Rutas corregidas sin el punto inicial para que Next.js compile bien
  content: [
    "src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdf9f3',
          100: '#faf3e8',
          200: '#f4e4cc',
          300: '#ecd0a8',
          400: '#e0b87e',
          500: '#d4a05a',
        },
        terracotta: {
          50: '#fdf3ee',
          100: '#fae4d4',
          200: '#f5c8aa',
          300: '#eda47c',
          400: '#e07d54',
          500: '#c46a3a',
          600: '#a8562d',
          700: '#8a4224',
        },
        sage: {
          50: '#f2f6f3',
          100: '#e2ece4',
          200: '#c3d8c7',
          300: '#97bca0',
          400: '#689b75',
          500: '#4a7d58',
          600: '#3d6648',
          700: '#2d4a35',
          800: '#1e3224',
          900: '#121e16',
        },
        forest: {
          700: '#2d4a3e',
          800: '#1e3228',
          900: '#121e18',
        },
        amber: {
          food: '#e8a96a',
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
        cursive: ["var(--font-playwrite)", "cursive"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;