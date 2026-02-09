import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import jest from "eslint-plugin-jest";

export default tseslint.config(
  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },

  // Recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Jest plugin recommended rules for test files
  {
    files: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
    plugins: { jest },
    rules: {
      ...jest.configs.recommended.rules,
    },
  },

  // Allow require() for jest.config.js
  {
    files: ["jest.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Ignores
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "eslint.config.mjs"],
  },
);
