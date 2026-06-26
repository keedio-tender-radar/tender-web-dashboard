import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#5b94ff", dark: "#3f73d6" },
      },
    },
  },
  plugins: [],
};

export default config;
