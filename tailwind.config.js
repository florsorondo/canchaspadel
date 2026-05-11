/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000", 
        secondary: "#ffffff",
        accent: "#f59e0b",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
}