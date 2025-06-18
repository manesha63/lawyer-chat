import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1b1e',       // Dark background - Main background
          sidebar: '#25262b',  // Slightly lighter - Sidebar/dropdown background
          text: '#D1D5DB',     // Off-White - Main text
          muted: '#8E8E93',    // Muted Gray - Secondary text
          border: '#2E2E38',   // Dim Gray - Borders/dividers
        }
      }
    }
  }
}

export default config