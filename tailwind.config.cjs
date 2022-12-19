/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
    },
    colors: {
      gray: {
        100: "#9CA3AF",
        200: "#4C5769",
        300: "#34415A",
        400: "#23293D",
      },
      "6-star": "#C64E28",
      "5-star": "#FFA000",
      "4-star": "#DBB1DB",
      "3-star": "#6291E9",
      "2-star": "#00897B",
      "1-star": "#9CA3AF",
      primary: "#6291E9",
      red: "#C62828",
    },
  },
  plugins: [],
};
