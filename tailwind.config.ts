import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        card: '#020617',
        accent: '#5D1B1D',
        accentSoft: '#8B3436'
      },
      boxShadow: {
        'soft-glow': '0 0 40px rgba(93, 27, 29, 0.25)'
      }
    }
  },
  plugins: []
};

export default config;

