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
        accent: '#ffc702',
        accentSoft: '#ffe066'
      },
      boxShadow: {
        'soft-glow': '0 0 40px rgba(255,199,2,0.25)'
      }
    }
  },
  plugins: []
};

export default config;

