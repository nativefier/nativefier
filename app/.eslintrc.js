const base = require('../base-eslintrc');

// # https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
module.exports = {
  parser: base.parser,
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: base.plugins,
  extends: base.extends,
  rules: base.rules,
  // https://eslint.org/docs/user-guide/configuring/ignoring-code#ignorepatterns-in-config-files
  ignorePatterns: [
    'node_modules/**',
    'lib/**',
    'dist/**',
    'built-tests/**',
    'coverage/**',
  ],
};
