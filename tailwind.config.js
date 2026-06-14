/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        uapa: {
          blue: "#0a3d91",
          sky: "#1d6fd6",
          orange: "#f7941d",
          gold: "#ffc24b",
          dark: "#060b18",
          panel: "#0d1730",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(29,111,214,0.35)",
        gold: "0 0 30px rgba(247,148,29,0.4)",
      },
    },
  },
  plugins: [],
};
