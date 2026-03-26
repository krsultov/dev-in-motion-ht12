import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#18181b',
          card: '#27272a',
          sidebar: '#1c1c1f',
        },
        accent: {
          purple: '#7c73e6',
          green: '#4ade80',
          red: '#f87171',
          amber: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}

export default config
