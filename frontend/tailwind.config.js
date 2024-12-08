const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f8ff",
          100: "#e4edff",
          200: "#c5daff",
          300: "#96bbff",
          400: "#6694ff",
          500: "#3366ff", // Main primary color
          600: "#1947e5",
          700: "#1335bf",
          800: "#102b99",
          900: "#0f2576",
        },
        dark: {
          100: "#d5d7db",
          200: "#acafb6",
          300: "#828792",
          400: "#595f6d",
          500: "#303749",
          600: "#262c3b",
          700: "#1c212d",
          800: "#13161f",
          900: "#090b10",
        },
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
