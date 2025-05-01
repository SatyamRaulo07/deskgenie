/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00f3ff',
        'dark-bg': '#0a0a0a',
        'glass': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px #00f3ff' },
          '50%': { boxShadow: '0 0 40px #00f3ff' },
        },
      },
    },
  },
  plugins: [],
} 