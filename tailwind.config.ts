import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: "#3B2A22",
          50: "#F7F5F4",
          100: "#EFECE9",
          200: "#D7CFCA",
          300: "#B9ABA2",
          400: "#917A6F",
          500: "#6B554B",
          600: "#544037",
          700: "#3B2A22",
          800: "#2B1E18",
          900: "#1A120E",
        },
        cream: {
          DEFAULT: "#FFF8EF",
          50: "#FFFCF7",
          100: "#FFF8EF",
          200: "#FEEDDF",
          300: "#FDD9C3",
        },
        caramel: {
          DEFAULT: "#C9824A",
          50: "#FDF8F3",
          100: "#F9ECE0",
          200: "#F2D5BD",
          300: "#E9B790",
          400: "#DD9A64",
          500: "#C9824A",
          600: "#AF6834",
          700: "#8E4F26",
          800: "#734023",
          900: "#5E361F",
        },
        softorange: "#F4A261",
        sage: {
          DEFAULT: "#78927A",
          50: "#F3F6F4",
          100: "#E4EBE5",
          200: "#C8D7CA",
          500: "#78927A",
          600: "#5F7661",
          700: "#495C4B",
        },
        charcoal: "#292929",
      },
    },
  },
  plugins: [],
};
export default config;
