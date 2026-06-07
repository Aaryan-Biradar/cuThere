/**
 * NOTE: This project uses Tailwind v4 via the @tailwindcss/postcss plugin, which
 * does NOT auto-load this JS config. The real source of truth for theme tokens is
 * the `@theme` block in src/app/globals.css. This file is kept only for editor /
 * tooling hints; the color values below mirror those tokens to avoid confusion.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'university-red': '#D71920',
        'university-red-hover': '#b81419',
        'brand-cream': '#FCFAF7',
      },
    },
  },
  plugins: [],
};
