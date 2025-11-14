/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#FFC107',
          orange: '#FF9800'
        },
        accent: {
          orange: '#FF5722',
          pink: '#E91E63',
          purple: '#9C27B0',
          blue: '#2196F3',
          green: '#4CAF50'
        }
      }
    },
  },
  plugins: [],
}
