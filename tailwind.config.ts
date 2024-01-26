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
        muted: {
          100: "rgb(248,243,238)",
          200: "rgb(133,134,136)",
          300: "rgb(138,139,141)",
          500: "rgb(75, 83, 97)",
          DEFAULT: "rgb(75, 83, 97)",
        }
      },
      fontFamily: {
        newsreader: ["Newsreader", "serif"],
      }
    },
  },
  plugins: [
  ],
} satisfies Config;
