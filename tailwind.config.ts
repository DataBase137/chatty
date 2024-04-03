import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        text: "#221C16",
        bg: "#F7F7F7",
        primary: "#C0BDA5",
        secondary: "#CC988E",
        accent: "#F39E6D",
        neutral: "#ECEBEB",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
