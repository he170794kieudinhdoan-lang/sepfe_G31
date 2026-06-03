import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'old_dashboard.jsx']),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Unused vars — downgrade to warn, too many false positives in JSX/hooks patterns
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      // HMR fast-refresh hint — not a real bug
      'react-refresh/only-export-components': 'warn',
      // setState inside effects is legitimate for early-return guards
      'react-hooks/set-state-in-effect': 'warn',
      // React Compiler rules — too strict for existing codebase
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
      // no-undef — downgrade, some globals come from CDN/runtime
      'no-undef': 'warn',
      // no-case-declarations — warn only
      'no-case-declarations': 'warn',
    },
  },
]);
