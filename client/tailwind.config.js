/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        crave: {
          bone: '#F2EAD8',
          bone2: '#E7DBC0',
          ink: '#181613',
          jade: '#0E8F6E',
          jadeDeep: '#0A5E49',
          poppy: '#F0431F',
          butter: '#F6C544',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Spline Sans Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0 #181613',
        'hard-sm': '3px 3px 0 #181613',
        'hard-lg': '6px 6px 0 #181613',
      },
      letterSpacing: {
        widest2: '.22em',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 2s infinite',
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
};
