import eslintJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

/** @typedef {import("eslint").Linter.FlatConfig} FlatConfig */

/** @type {FlatConfig[]} */
export default [
  eslintJs.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", "docs/**", "types/**"],
  },
];
