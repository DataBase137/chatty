import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1F2937",
        secondary: "#FF6B4A",
        accent: "#FFE8D6",
        plum: "#7B5EA7",
        teal: "#4DD7B0",
        dark: "#1F1F1F",
        light: "#F7F7F7",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
