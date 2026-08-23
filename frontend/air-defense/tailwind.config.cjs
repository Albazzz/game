/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        jp: ['Noto Sans JP', 'Yu Gothic', 'Segoe UI', 'sans-serif']
      },
      colors: { sakura: '#ff5d9e', cyan: '#4fd1ff', gold: '#ffc860' }
    }
  },
  plugins: []
}
