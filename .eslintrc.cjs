/** @type {import('@types/eslint').Linter.Config} */
module.exports = {
  extends: [
    "@lytovka",
    "@lytovka/eslint-config/react",
    "@lytovka/eslint-config/jsx-a11y",
    "@lytovka/eslint-config/import",
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
  "ignorePatterns": ["dist/**", "demo/**", "**/*.dev.*"],
  rules: {
    "consistent-return": "off",
    "@typescript-eslint/no-empty-function": "off",
  },
};
