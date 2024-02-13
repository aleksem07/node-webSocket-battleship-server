module.exports = {
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    'no-console': 0,
    '@typescript-eslint/no-var-requires': 0,
    'max-len': ['error', 100],
  },
};
