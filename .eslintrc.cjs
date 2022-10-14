module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["@babel"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: "module",
    babelOptions: {
      plugins: ["@babel/plugin-syntax-import-assertions"],
    },
  },
  env: {
    es2022: true,
    browser: true,
    node: true,
  },
};
