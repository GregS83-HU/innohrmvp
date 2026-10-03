import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Build output and generated files - linting them reported thousands of
    // problems in code nobody writes.
    ignores: [".next/**", "out/**", "build/**", "coverage/**", ".vercel/**", ".claude/**", "public/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // A leading underscore marks a deliberately unused binding (mock
      // signatures, destructured-away fields).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Test doubles mimic loosely-typed third-party clients (supabase-js query
    // builders, Stripe objects); typing every mock precisely adds noise
    // without catching bugs. App code keeps the rule.
    files: ["test/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default eslintConfig;
