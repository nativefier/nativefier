// # https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    'prettier/prettier': 'error',
    // TODO remove when done killing anys and making tsc strict
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
  },
};
