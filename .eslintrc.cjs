module.exports = {
  root: true,
  extends: ["@nuxt/eslint-config", "plugin:tailwindcss/recommended"],
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
    },
  ],
  rules: {
    "tailwindcss/no-custom-classname": "off",
  }
};
