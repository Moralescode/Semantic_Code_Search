/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fc',
          100: '#dbe3f5',
          200: '#b8c9e8',
          300: '#8aa3d4',
          400: '#5c7bbf',
          500: '#3a5a9e',
          600: '#2a4478',
          700: '#1e335a',
          800: '#152542',
          900: '#0d1a2d',
          950: '#060d1a',
        },
        gold: {
          50: '#fdf8ef',
          100: '#f9edd5',
          200: '#f2d8a8',
          300: '#e8bc6e',
          400: '#d4a03f',
          500: '#c5a55a',
          600: '#a8883e',
          700: '#8a6c30',
          800: '#6e5326',
          900: '#5a4420',
        },
        surface: {
          DEFAULT: '#ffffff',
          hover: '#f8fafc',
          alt: '#f0f4fc',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0b1f4a',
        },
        secondary: '#c5a55a',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        destructive: '#ef4444',
      },
      fontFamily: {
        heading: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(10, 22, 40, 0.06), 0 1px 2px rgba(10, 22, 40, 0.04)',
        cardHover: '0 4px 12px rgba(10, 22, 40, 0.1), 0 2px 4px rgba(10, 22, 40, 0.06)',
        sidebar: '2px 0 8px rgba(0, 0, 0, 0.04)',
        header: '0 1px 3px rgba(10, 22, 40, 0.08)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
