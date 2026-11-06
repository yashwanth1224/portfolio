/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cinematic Palette
        'cinematic-cream': '#F5F2EB',
        'cinematic-sand': '#E8DEC9',
        'cinematic-charcoal': '#1A1A1A',
        'cinematic-accent': '#D95D39',
        'cinematic-accent-hover': '#C04D2B',
        
        // Semantic color aliases
        charcoal: {
          DEFAULT: '#1A1A1A',
          dark: '#111111',
          surface: '#222222',
          card: '#252525',
          border: '#333333',
        },
        cream: {
          DEFAULT: '#F5F2EB',
          light: '#FFFFFF',
          soft: '#FAF8F5',
          dark: '#E8DEC9',
        },
        sand: {
          DEFAULT: '#E8DEC9',
          light: '#F2EBDC',
          dark: '#D8CBB2',
          border: '#D0C2A4',
        },
        burntOrange: {
          DEFAULT: '#D95D39',
          hover: '#C04D2B',
          light: '#E77553',
          glow: 'rgba(217, 93, 57, 0.35)',
        },
        accent: {
          DEFAULT: '#D95D39',
          hover: '#C04D2B',
          blue: '#D95D39',
          royal: '#D95D39',
          light: '#E77553',
        },

        // Legacy compatibility mappings
        obsidian: {
          DEFAULT: '#1A1A1A',
          surface: '#222222',
          card: '#252525',
        },
        navy: {
          DEFAULT: '#1A1A1A',
          dark: '#111111',
          light: '#282828',
          deep: '#0D0D0D',
        },
        slateBanner: {
          DEFAULT: '#E8DEC9',
          light: '#F5F2EB',
          border: '#D0C2A4',
        },
        coral: {
          DEFAULT: '#D95D39',
          light: '#E77553',
          dark: '#C04D2B',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.6', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
