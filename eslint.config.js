import path from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import cssModulesPlugin from 'eslint-plugin-css-modules';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: { rules: {} },
});

export default defineConfig([
	// 1. Global Ignores
	{
		ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**'],
	},

	// 2. Base Compatibility Extensions (Standard ESLint and Import)
	...compat.extends('eslint:recommended', 'plugin:import/errors', 'plugin:import/warnings'),

	// 3. Global Settings for React Version and Import Resolver
	{
		settings: {
			react: { version: 'detect' },
			'import/resolver': { typescript: { project: './tsconfig.json' } },
		},
	},

	// A. Type-Checking and React Extensions for TS/TSX files
	...compat
		.extends(
			'plugin:@typescript-eslint/recommended',
			'plugin:@typescript-eslint/recommended-requiring-type-checking',
			'plugin:import/typescript',
			'plugin:react/recommended',
			'plugin:react/jsx-runtime',
			'plugin:react-hooks/recommended',
			'plugin:jsx-a11y/recommended'
		)
		.map((config) => ({
			...config,
			files: ['**/*.ts', '**/*.tsx'],
		})),

	// 4. Configuration for TypeScript/React files (Manual overrides and Language Options)
	{
		files: ['**/*.ts', '**/*.tsx'],

		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			'unused-imports': unusedImportsPlugin,
			'css-modules': cssModulesPlugin,
			'react-refresh': reactRefreshPlugin,
			import: importPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
			'@next/next': nextPlugin,
			'jsx-a11y': jsxA11yPlugin,
		},
		settings: {
			'css-modules': { extensions: ['.css', '.scss', '.module.css', '.module.scss'] },
		},
		rules: {
			// TypeScript Best Practices
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': 'off',

			// Most-used rules
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': 'error',

			// React Rules (Override for New JSX Transform)
			'react/react-in-jsx-scope': 'off',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'react/self-closing-comp': 'error',
			'react/jsx-no-useless-fragment': 'error',

			// Unused Imports
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': ['error', { vars: 'all', args: 'after-used' }],

			// CSS Modules & Refresh
			'css-modules/no-unused-class': [2, { camelCase: true }],
		},
	},

	// B. React Extensions for JS/JSX files
	...compat
		.extends(
			'plugin:@typescript-eslint/recommended',
			'plugin:@typescript-eslint/recommended-requiring-type-checking',
			'plugin:import/typescript',
			'plugin:react/recommended',
			'plugin:react/jsx-runtime',
			'plugin:react-hooks/recommended',
			'plugin:jsx-a11y/recommended'
		)
		.map((config) => ({
			...config,
			files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
		})),

	// 5. Configuration for standard JS files
	{
		files: ['**/*.js', '**/*.jsx', '**/*.mjs'],

		languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
		plugins: {
			'unused-imports': unusedImportsPlugin,
			'css-modules': cssModulesPlugin,
			import: importPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
			'@next/next': nextPlugin,
			'jsx-a11y': jsxA11yPlugin,
		},
		settings: { 'css-modules': { extensions: ['.css', '.scss', '.module.css', '.module.scss'] } },
		rules: {
			'react/react-in-jsx-scope': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': ['error'],
			'css-modules/no-unused-class': [2, { camelCase: true }],
		},
	},

	// 6. General Rules (Import and Next-specific rules)
	{
		plugins: { import: importPlugin, '@next/next': nextPlugin },
		rules: {
			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],

			// Disabled; Next + TS handles this better
			'import/no-unresolved': 'off',

			'import/newline-after-import': 'warn',
			'import/no-duplicates': 'error',

			// Commonly used import rules
			'import/no-extraneous-dependencies': 'error',
			'import/no-cycle': 'warn',

			'@next/next/no-img-element': 'error',
			'@next/next/no-sync-scripts': 'warn',
		},
	},
]);
