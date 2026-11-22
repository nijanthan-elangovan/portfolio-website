/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"Work Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: {
          50: '#fdfbf4',
          100: '#f7f2e6',
          200: '#efe7d2',
          300: '#ddd3b8',
        },
        ink: {
          900: '#1b1a17',
          800: '#242320',
          700: '#36332c',
        },
        mark: {
          DEFAULT: '#c2410c',
          light: '#ea580c',
        },
      },
    },
  },
  plugins: [],
}
