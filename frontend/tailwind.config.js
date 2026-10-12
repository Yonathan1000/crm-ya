/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Paleta oficial YA extraída de Adobe Illustrator (LOGO YA.ai)
        ya: {
          50: '#f0f9fd',
          100: '#e0f3fb',
          200: '#b9e5f7',
          300: '#7ccdf1',
          400: '#38b5ea',
          500: '#009fe3', // Azul vibrante del Logo YA
          600: '#008cc8', // Tono medio
          700: '#0074a6',
          800: '#005980',
          900: '#004b6a', // Azul marino profundo del Logo YA
          950: '#002f43',
          bg: '#F4F5F7',
          sidebar: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E5E7EB',
          primary: '#009fe3',
          'primary-hover': '#008cc8',
          dark: '#004b6a',
        },
        // Ajuste de escala blue para unificar todos los componentes a la identidad YA
        blue: {
          50: '#f0f9fd',
          100: '#e0f3fb',
          200: '#b9e5f7',
          300: '#7ccdf1',
          400: '#38b5ea',
          500: '#009fe3', // #009fe3 oficial
          600: '#008cc8',
          700: '#0074a6',
          800: '#005980',
          900: '#004b6a', // #004b6a oficial
          950: '#002f43',
        },
        pipeline: {
          'new-bg': '#DBEAFE',
          'new-text': '#3B82F6',
          'new-border': '#93C5FD',
          'contact-bg': '#FEF3C7',
          'contact-text': '#F59E0B',
          'contact-border': '#FCD34D',
          'proposal-bg': '#FFEDD5',
          'proposal-text': '#F97316',
          'proposal-border': '#FDBA74',
          'won-bg': '#DCFCE7',
          'won-text': '#22C55E',
          'won-border': '#86EFAC',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
