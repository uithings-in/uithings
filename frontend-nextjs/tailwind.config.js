/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-bricolage)", "Bricolage Grotesque", "sans-serif"],
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "#05050A",
          dark: "#080811",
          card: "#0c0d18",
          cardBorder: "#1e1f38",
          purpleGlow: "#6C5CE7",
          indigoGlow: "#3B2FE0",
          deepIndigo: "#2A2470",
          primary: "#4B3DF5",
          primaryHover: "#3e2fe4",
          violet: "#7C5CFF",
          muted: "#A6A6C1",
          subtext: "#9494B8",
        },
      },
      borderRadius: {
        "2xl": "1.25rem", // 20px
        "3xl": "1.75rem", // 28px
      },
    },
  },
  plugins: [],
};
