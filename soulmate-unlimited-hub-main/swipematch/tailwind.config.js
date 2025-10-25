/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF1744', // Vibrant red/pink - 2Sweety brand color
        'secondary': '#E91E63', // Deep pink - secondary brand color
        'accent': '#FF4081', // Light pink accent
        'background': '#FAFAFA', // Clean light background
        'surface': '#FFFFFF', // Pure white surface
        'text-primary': '#212121', // Dark charcoal - primary text
        'text-secondary': '#757575', // Medium gray - secondary text
        'success': '#4CAF50', // Green for success states
        'warning': '#FF9800', // Orange for warnings
        'error': '#F44336', // Red for errors
        'border': '#E0E0E0', // Light gray borders
        'pink-gradient-start': '#FF1744',
        'pink-gradient-end': '#E91E63',
        'muted': '#9E9E9E',
        'card-bg': '#FFFFFF',
        'hover-bg': '#F5F5F5'
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'caption': ['Roboto', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'title': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'subtitle': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(255, 23, 68, 0.15)',
        'brand-md': '0 4px 16px rgba(255, 23, 68, 0.2)',
        'brand-lg': '0 8px 32px rgba(255, 23, 68, 0.25)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      gradients: {
        'brand': 'linear-gradient(135deg, #FF1744 0%, #E91E63 100%)',
        'brand-light': 'linear-gradient(135deg, rgba(255, 23, 68, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
      },
      borderRadius: {
        'brand': '16px',
        'card': '12px',
        'button': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'section': '5rem',
      },
      minHeight: {
        'touch': '48px',
        'hero': '60vh',
      },
      zIndex: {
        'navigation': '100',
        'chat-header': '200',
        'dropdown': '300',
        'notification': '150',
        'modal': '1000',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
        'scale-in': 'scaleIn 300ms ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}