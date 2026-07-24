/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#1D1E22',
        surface: '#25262B',
        input: '#151518',
        primary: '#00A67D',
        'primary-pressed': '#008D6A',
        ink: '#F5F5F6',
        muted: '#81828A',
        line: '#313238',
        danger: '#E64A55',
        warning: '#E6A72F',
        success: '#78B800',
      },
    },
  },
  plugins: [],
};
