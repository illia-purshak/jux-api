// @ts-check
import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "coverage/", "node_modules/", "eslint.config.mjs"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // Formatting for TS/JS (Prettier handles only JSON/MD/YAML). Autofixed on save and by `pnpm run format`.
  // Style issues are warnings, so they never block anything.
  {
    plugins: { "@stylistic": stylistic },
    rules: Object.fromEntries(
      Object.entries(
        stylistic.configs.customize({
          indent: 2,
          semi: true,
          commaDangle: "always-multiline",
          braceStyle: "1tbs",
          arrowParens: true,
          quoteProps: "consistent-as-needed",
          jsx: false,
        }).rules ?? {},
      ).map(([rule, entry]) => [
        rule,
        Array.isArray(entry) ? ["warn", ...entry.slice(1)] : "warn",
      ]),
    ),
  },
  {
    rules: {
      // Quotes are not touched: single and double are both fine.
      "@stylistic/quotes": "off",
      // `a &&\n b`, `cond\n ? x\n : y` — operators stay where they are written.
      "@stylistic/operator-linebreak": "off",
    },
  },
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // `any` / unsafe usage — warn, not error.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      // `unknown` in unions (`string | unknown`) and in template strings — warn.
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/restrict-template-expressions": [
        "warn",
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],

      // Unused imports/variables — warn; `_`-prefixed names are intentionally unused.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Unhandled promises are real bugs — keep as error (`void promise` opts out explicitly).
      "@typescript-eslint/no-floating-promises": "error",
      // Allow async callbacks where a void callback is expected (Express/Nest handlers, event listeners).
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      // `async` without `await` is fine (interface implementations, Nest lifecycle hooks).
      "@typescript-eslint/require-await": "off",
      // Empty interfaces/classes are common in Nest (`class X extends Dto(...) {}`).
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.e2e-spec.ts", "test/**/*.ts"],
    rules: {
      // `expect(service.method)` / mocks.
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
