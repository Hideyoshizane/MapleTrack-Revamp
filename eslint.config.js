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
			react: {
				version: 'detect',
			},
			'import/resolver': {
				typescript: {
					project: './tsconfig.json',
				},
			},
		},
	},

	// A. Type-Checking and React Extensions for TS/TSX files
	// The `.map` ensures the `files` property is correctly added to each config object in the array.
	...compat
		.extends(
			'plugin:@typescript-eslint/recommended',
			'plugin:@typescript-eslint/recommended-requiring-type-checking',
			'plugin:import/typescript',
			'plugin:react/recommended',
			'plugin:react/jsx-runtime', // Crucial for New JSX Transform
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
			'css-modules': {
				extensions: ['.css', '.scss', '.module.css', '.module.scss'],
			},
		},
		rules: {
			// TSLint Rules (Overrides)
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',

			// React Rules (Override for New JSX Transform)
			'react/react-in-jsx-scope': 'off',

			// Unused Imports
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
			],

			// CSS Modules & Refresh
			'css-modules/no-unused-class': [2, { camelCase: true }],
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},

	// B. React Extensions for JS/JSX files
	...compat
		.extends(
			'plugin:react/recommended',
			'plugin:react/jsx-runtime',
			'plugin:react-hooks/recommended',
			'plugin:jsx-a11y/recommended'
		)
		.map((config) => ({
			...config,
			files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
		})),

	// 5. Configuration for standard JS files (Manual overrides and Language Options)
	{
		files: ['**/*.js', '**/*.jsx', '**/*.mjs'],

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: {
			'unused-imports': unusedImportsPlugin,
			'css-modules': cssModulesPlugin,
			import: importPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
			'@next/next': nextPlugin,
			'jsx-a11y': jsxA11yPlugin,
		},
		settings: {
			'css-modules': {
				extensions: ['.css', '.scss', '.module.css', '.module.scss'],
			},
		},
		rules: {
			'react/react-in-jsx-scope': 'off',

			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
			],
			'css-modules/no-unused-class': [2, { camelCase: true }],
		},
	},

	// 6. General Rules (Import and Next-specific rules)
	{
		plugins: {
			import: importPlugin,
			'@next/next': nextPlugin,
		},
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
			'import/no-unresolved': 'error',
			'import/newline-after-import': 'warn',
			'import/no-duplicates': 'error',
			'@next/next/no-img-element': 'error',
			'@next/next/no-sync-scripts': 'warn',
		},
	},
]);
