/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#7CB342',
        'primary-blue': '#2196F3',
        'primary-orange': '#FF9800',
        'accent-light-green': '#C8E6C9',
        'accent-light-blue': '#BBDEFB',
        'accent-light-orange': '#FFE0B2',
        'text-dark': '#333333',
        'text-gray': '#666666',
        'text-light-gray': '#999999',
        'text-white': '#FFFFFF',
        'bg-light': '#F8F9FA',
        'bg-white': '#FFFFFF',
        'border-gray': '#E0E0E0',
        'border-light': '#F0F0F0',
        'background-light': '#F8F9FA',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'fredoka': ['Fredoka', 'sans-serif'],
      },
      fontSize: {
        'large-title': '2.5rem',
        'small-title': '1.5rem',
        'body': '1rem',
        'small': '0.875rem',
        'tiny': '0.75rem',
      },
      spacing: {
        'section-spacing': '2rem',
        'module-spacing': '1.5rem',
      },
      borderRadius: {
        'standard': '0.75rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'orange-hover': '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        'gradient-orange': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      },
    },
  },
  plugins: [],
}
