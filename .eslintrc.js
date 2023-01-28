module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    rules: {
      'import/extensions': ['error', 'ignorePackages', {
        '': 'never',
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      }],
      'no-process-env': 2,
      'prettier/prettier': 2,
      '@typescript-eslint/no-use-before-define': 'off',
    },
  };