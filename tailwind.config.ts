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
        quirona: {
          bg: "#DAD6BB",           // Sage Sand (Fondo general base)
          yellow: "#FFDD48",       // Star Yellow (Acento estrella / CTA)
          "yellow-hover": "#e6c63b",
          burgundy: "#661716",     // Deep Burgundy (Texto oscuro, borders, botones)
          "burgundy-dark": "#4a0f0e",
          "burgundy-light": "#852322",
          cream: "#FFECB9",        // Soft Butter Cream (Cards, inputs, modales)
          "cream-light": "#fff6dd",
        },
      },
      fontFamily: {
        retro: ["var(--font-retro)", "Cooper Black", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        retro: "4px 4px 0px 0px #661716",
        "retro-lg": "6px 6px 0px 0px #661716",
        "retro-sm": "2px 2px 0px 0px #661716",
      },
    },
  },
  plugins: [],
};

export default config;
