module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["@babel"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: "module",
  },
  env: {
    es2021: true,
    browser: true,
    node: true,
  },
};
