/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tweak in M5 (tag-style) and M6 (due-tint)
        feature: '#10B981', // emerald
        bug: '#DC2626',     // crimson
      },
    },
  },
  plugins: [],
};
