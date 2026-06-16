/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'star-dark': '#0a0a1f',
        'star-purple': '#2d1b69',
        'star-blue': '#1e3a5f',
        'star-gold': '#ffd700',
        'star-pink': '#ff6b9d',
        'star-cyan': '#00d4ff',
        'star-orange': '#f97316',
      },
      fontFamily: {
        'fantasy': ['Georgia', 'serif'],
      },
      animation: {
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'star-fall': 'starFall 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #ffd700, 0 0 10px #ffd700' },
          '100%': { boxShadow: '0 0 20px #ffd700, 0 0 30px #ffd700' },
        },
        starFall: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
