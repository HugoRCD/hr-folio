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
        dark: "var(--dark-color)",
        light: "var(--light-color)",
        accent: "var(--accent-color)",
      },
      textColor: {
        dark: "var(--dark-color)",
        light: "var(--light-color)",
        accent: "var(--accent-color)",
        muted: "var(--muted-color)",
      },
      fontFamily: {
        newsreader: ["Newsreader", "serif"],
      }
    },
  },
  plugins: [
  ],
} satisfies Config;
