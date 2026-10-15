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
        // Subtle Greenish Light Theme Tokens
        'sage': {
          50: '#f4f7f4',
          100: '#e9f0ea',
          200: '#cbdad0',
          300: '#b8c9bf',
          400: '#8ba394',
          500: '#4b5e53',
          600: '#34473c',
          700: '#23342a',
          800: '#1b2e23',
          900: '#0f1a14',
        },
        'forest-charcoal': '#0f1a14',
        'forest-border': '#1b2e23',
        'forest-divider': '#cbdad0',
        'slate-pine': '#4b5e53',
        'emerald-accent': '#059669',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'brutal-forest': '4px 4px 0px 0px #1b2e23',
        'brutal-forest-sm': '2px 2px 0px 0px #1b2e23',
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
