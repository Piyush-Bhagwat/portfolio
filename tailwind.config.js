/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        'terminal-green': '#10b981',
        'terminal-cyan': '#06b6d4',
        'terminal-bg': '#09090b',
        'terminal-card': '#121215',
        'terminal-border': '#27272a',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'brutal-white': '4px 4px 0px 0px rgba(255,255,255,1)',
        'brutal-white-sm': '2px 2px 0px 0px rgba(255,255,255,1)',
        'brutal-cyan': '4px 4px 0px 0px #06b6d4',
        'brutal-cyan-sm': '2px 2px 0px 0px #06b6d4',
        'brutal-green': '4px 4px 0px 0px #10b981',
        'brutal-green-sm': '2px 2px 0px 0px #10b981',
      },
    },
  },
  plugins: [
    typography,
  ],
};
