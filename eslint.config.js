import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import noCommentedCode from "eslint-plugin-no-commented-code";
import globals from "globals";

const bunGlobals = {
  Bun: "readonly",
};

export default [
  {
    ignores: ["dist/**", "build/**", "node_modules/**"],
  },

  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        ...bunGlobals,
      },
    },
  },

  // TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...bunGlobals,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "no-commented-code": noCommentedCode,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-namespace": [
        "error",
        {
          allowDeclarations: true,
        },
      ],
      "no-commented-code/no-commented-code": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
