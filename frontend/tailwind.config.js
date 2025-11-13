/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VTellTales Brand Colors
        'primary-yellow': '#F3D657',
        'primary-blue': '#5BCCF6',
        'primary-white': '#FFFFFF',
        'primary-black': '#1A1A1A',
        
        // Accent Colors
        'accent-orange': '#FF6B35',
        'accent-green': '#4CAF50',
        'accent-red': '#E53E3E',
        'accent-purple': '#8B5CF6',
        
        // Neutral Palette
        'grey': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Semantic Colors
        'success': {
          light: '#E8F5E8',
          main: '#4CAF50',
          dark: '#2E7D32',
        },
        'warning': {
          light: '#FFF3E0',
          main: '#FF9800',
          dark: '#E65100',
        },
        'error': {
          light: '#FFEBEE',
          main: '#E53E3E',
          dark: '#C62828',
        },
        'info': {
          light: '#E3F2FD',
          main: '#2196F3',
          dark: '#1565C0',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}