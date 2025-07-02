import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'eslint.config.mjs',
      '**/dist/**/*',
      '**/node_modules/**/*',
      '**/coverage/**/*',
      '**/*.d.ts',
      '.next/**/*',
      '.husky/**/*',
      'client/.next/**/*',
      'server/templates/**/*',
      'temp/**/*',
      '**/*.spec.ts',
      '**/*.min.js',
      // Ignore problematic config files
      '*.config.js',
      '**/*.config.js',
      'commitlint.config.js',
      'client/postcss.config.js',
      'client/tailwind.config.js',
      'client/next.config.ts',
      'server/nest-cli.json',
    ],
  },

  // Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,

  // Node.js environment (server src only)
  {
    files: ['server/src/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-empty-function': 'warn',

      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      complexity: ['warn', 20],
      'max-lines': ['warn', 500],
      'max-lines-per-function': ['warn', 100],
    },
  },

  // Next.js/React environment (client)
  {
    files: ['client/src/**/*.{ts,tsx,js,jsx}'],
    extends: [...compat.extends('next/core-web-vitals', 'next/typescript')],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // For Next.js
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      next: {
        rootDir: 'client/',
      },
    },
    rules: {
      // React/Next.js specific rules
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'warn',

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',

      '@next/next/no-img-element': 'warn',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-html-link-for-pages': 'off',

      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      complexity: ['warn', 20],
      'max-lines': ['warn', 800],
      'max-lines-per-function': ['warn', 150],
    },
  },

  // Client config files
  {
    files: ['client/*.{ts,js,mjs}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },

  // Server config files
  {
    files: ['server/*.{ts,js,mjs}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },

  // Component exceptions
  {
    files: [
      'client/src/components/**/*.tsx',
      'client/src/app/**/*.tsx',
      'client/src/components/**/modals/*.tsx',
    ],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },

  // Test files
  {
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/test/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },

  // Special files
  {
    files: ['server/src/generator/services/generation.service copy.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      complexity: 'off',
    },
  },
);
