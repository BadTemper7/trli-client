// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A1A14", // Dark green background from screenshots
        surface: "#11241D", // Slightly lighter for cards
        surfaceLight: "#1A332A",
        accentGreen: "#4ADE80", // Active/Pre-Advice
        accentBlue: "#38BDF8", // In Yard
        accentYellow: "#FACC15", // Pending
      },
    },
  },
  plugins: [],
};
