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
        "toekn-orange": "#E06600",
        "toekn-white": "#F7F7F7",
        "toekn-dark-white": "#F2F2F2",
        "toekn-dark-orange": "#A04000",
        "toekn-black": "#111314",
        "toekn-popup-bg": "#2d3748",
      },
      fontFamily: {
        "toekn-bold": ["Space Grotesk Bold", "sans-serif"],
        "toekn-regular": ["Space Grotesk Regular", "sans-serif"],
        "toekn-light": ["Space Grotesk light", "sans-serif"],
        "toekn-semibold": ["Space Grotesk Semibold", "sans-serif"],
      },
      fontSize: {
        "toekn-banner-header": "3.25rem",
        "toekn-banner-header-mobile": "2rem",
        "toekn-title": "1.5rem",
        "toekn-title-mobile": "1rem",
        "toekn-subtitle": "1rem",
        "toekn-subtitle-mobile": "0.75rem",
        "toekn-text": "0.75rem",
        "toekn-text-mobile": "0.5rem",
      },
      screens: {
        "ct-sm": "321px",
        "ct-md": "688px",
        "ct-lg": "980px",
        "ct-xl": "1248px",
      },
      boxShadow:{
        cryptoTaskHover: "0 0 5px 2px rgba(255, 165, 0, 0.7);",
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};
export default config;
