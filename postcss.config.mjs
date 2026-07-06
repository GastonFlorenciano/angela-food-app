/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Next.js y Tailwind v4 se encargan del resto solos
  },
};

export default config;