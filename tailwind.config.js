/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1F33",
          "navy-light": "#163A5C",
          "navy-dark": "#071524",
          green: "#16A34A",
          "green-wa": "#25D366",
          "green-dark": "#15803D",
          muted: "#64748B",
          border: "#E2E8F0",
          bg: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
