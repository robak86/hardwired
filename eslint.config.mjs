// @ts-check
import eslint from '@eslint/js';
import typescriptLint from 'typescript-eslint';
// imports
import unusedImports from 'eslint-plugin-unused-imports';
// @ts-expect-error no @types for eslint-plugin-import
import imports from 'eslint-plugin-import';
import stylistic from '@stylistic/eslint-plugin';
// react
import pluginReact from 'eslint-plugin-react';
import pluginRefresh from 'eslint-plugin-react-refresh';
// @ts-expect-error no @types for eslint-plugin-react-hooks
import pluginHooks from 'eslint-plugin-react-hooks';
// prettier
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';

const commonPaddingRules = [
  { blankLine: 'always', prev: '*', next: 'return' },

  // require blank lines before and after if, function, fur, while, and switch statements
  {
    blankLine: 'always',
    prev: '*',
    next: ['if', 'function', 'for', 'while', 'switch'],
  },
  {
    blankLine: 'always',
    prev: ['if', 'function', 'for', 'while', 'switch'],
    next: '*',
  },

  //require blank lines after every sequence of imports
  { blankLine: 'always', prev: ['import', 'require'], next: '*' },
  {
    blankLine: 'any',
    prev: ['import', 'require'],
    next: ['import', 'require'],
  },

  // require blank lines after every sequence of types definition
  { blankLine: 'always', prev: ['interface', 'type'], next: '*' },
  {
    blankLine: 'any',
    prev: ['interface', 'type'],
    next: ['interface', 'type'],
  },
];

export default typescriptLint.config(
  eslint.configs.recommended,
  typescriptLint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  typescriptLint.configs.stylistic,
  {
    name: 'typescript overrides',
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/class-literal-property-style': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_[^_].*$|^_$',
          varsIgnorePattern: '^_[^_].*$|^_$',
          caughtErrorsIgnorePattern: '^_[^_].*$|^_$',
        },
      ],
    },
  },
  // Overrides for test files
  {
    files: ['packages/*/src/**/*.test.{ts,tsx}', 'packages/**/__test__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    ignores: ['**/*.d.ts', '**/dist/**'],
  },

  pluginRefresh.configs.recommended,

  //@ts-expect-error messed up types in eslint-plugin-react
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      'react-hooks': pluginHooks,
    },
    rules: {
      ...pluginHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react/display-name': 'off',
    },
  },

  {
    name: 'imports and unused imports',
    plugins: {
      import: imports,
      'unused-imports': unusedImports,
      '@stylistic': stylistic,
    },
    rules: {
      'import/first': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          // 'newlines-between': 'always-and-inside-groups',
        },
      ],
      'import/no-unresolved': 'off',
      'import/no-relative-packages': 'error',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        ...commonPaddingRules,

        // require blank lines after every sequence of variable declarations
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
);
