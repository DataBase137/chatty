import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sunset: "#FF6B4A",
        peach: "#FFE8D6",
        plum: "#7B5EA7",
        teal: "#4DD7B0",
        dark: "#333333",
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
