/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // add big custom shadow
      boxShadow: {
        'deep': '11px 15px 26px -8px rgba(0,0,0,0.3)',
        'deep-float': '19px 23px 29px -8px rgba(0,0,0,0.3)',
        'very-deep': '16px 24px 17px -4px rgba(0,0,0,0.5)',
        'very-deep-float': '12px 20px 24px -4px rgba(0,0,0,0.5)',
      },
      fontFamily: {
        mono: ['var(--font-ibm-plex-mono)'],
        heavy: ['var(--font-ibm-plex-mono-heavy)'],
      },
    },
  },
  plugins: [],
}

