/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', '"VT323"', '"Courier New"', 'monospace'],
      },
      animation: {
        'tile-pop': 'tilePop 0.2s ease-out',
        'tile-merge': 'tileMerge 0.22s ease-out',
        'shine': 'shine 1.5s ease-in-out infinite',
      },
      keyframes: {
        tilePop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        tileMerge: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)', filter: 'brightness(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
        shine: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))' },
          '50%': { filter: 'brightness(1.3) drop-shadow(0 0 14px rgba(250, 204, 21, 1))' },
        },
      },
    },
  },
  plugins: [],
};
