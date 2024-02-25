/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-ibm-plex-mono)'],
        heavy: ['var(--font-ibm-plex-mono-heavy)'],
      },
    },
  },
  plugins: [],
}

