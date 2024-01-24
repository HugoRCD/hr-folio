import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        dark: "rgb(2,2,2)",
        light: "rgb(248,243,238)",
        accent: "rgb(40,60,255)",
      },
      textColor: {
        dark: "rgb(2,2,2)",
        light: "rgb(248,243,238)",
        accent: "rgb(40,60,255)",
      },
      fontFamily: {
        newsreader: ["Newsreader", "serif"],
      }
    },
  },
  plugins: [
  ],
} satisfies Config;
