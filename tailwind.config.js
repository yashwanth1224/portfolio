/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Yashwanth Resume Palette
        navy: {
          DEFAULT: '#0B1B2B',
          dark: '#07131F',
          light: '#132A40',
          deep: '#050D15',
        },
        accent: {
          DEFAULT: '#38BDF8',
          blue: '#0284C7',
          royal: '#2563EB',
          light: '#7DD3FC',
        },
        slateBanner: {
          DEFAULT: '#E8ECF2',
          light: '#F1F5F9',
          border: '#CBD5E1',
        },
        cream: {
          DEFAULT: '#F8FAFC',
          dark: '#E2E8F0',
          light: '#FFFFFF',
        },
        obsidian: {
          DEFAULT: '#07111A',
          surface: '#0B1B28',
          card: '#102232',
        },
        // Backward compatibility mappings so existing classes inherit the resume palette
        terracotta: {
          DEFAULT: '#0B1B2B',
          dark: '#07131F',
          light: '#132A40',
        },
        coral: {
          DEFAULT: '#38BDF8',
          light: '#7DD3FC',
          dark: '#0284C7',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Fraunces"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
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
