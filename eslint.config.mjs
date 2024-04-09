import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
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
