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
        accent: '#f97316',
        accentSoft: '#fed7aa'
      },
      boxShadow: {
        'soft-glow': '0 0 40px rgba(249,115,22,0.25)'
      }
    }
  },
  plugins: []
};

export default config;

