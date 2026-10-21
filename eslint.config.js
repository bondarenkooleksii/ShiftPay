import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'cypress/screenshots/**', 'cypress/videos/**'],
  },
  prettierRecommended,
];
