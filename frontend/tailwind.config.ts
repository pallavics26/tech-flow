import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff1ee",
          100: "#ffe0d9",
          400: "#ff8a76",
          500: "#ff6b5b",
          600: "#e8503f",
          700: "#c23e2f",
        },
        teal: {
          50: "#e6f7f5",
          100: "#c2ebe6",
          500: "#17a398",
          600: "#128a80",
        },
        amber: {
          50: "#fef6e7",
          100: "#fce8bf",
          500: "#f4a621",
          600: "#d88f11",
        },
        violet: {
          50: "#f1efff",
          100: "#e0dcff",
          500: "#6c5ce7",
          600: "#5645c9",
        },
        canvas: {
          light: "#f7f5f2",
          dark: "#15161a",
        },
        surface: {
          light: "#ffffff",
          dark: "#1e2027",
        },
      },
    },
  },
  plugins: [],
};
export default config;