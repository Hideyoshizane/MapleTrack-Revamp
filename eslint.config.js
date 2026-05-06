import path from 'path';
import { fileURLToPath } from 'url';

import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: { rules: {} },
});

export default defineConfig([
	// Global ignores
	{ ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**'] },

	// Base ESLint & Prettier extensions
	...compat.extends('eslint:recommended'),
	...compat.extends('prettier'),

	// TypeScript + React specific
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': { typescript: { project: './tsconfig.json' } },
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'unused-imports': unusedImportsPlugin,
			'react-refresh': reactRefreshPlugin,
			'@next/next': nextPlugin,
			unicorn: unicornPlugin,
			import: fixupPluginRules(importPlugin),
			react: reactPlugin,
			perfectionist: perfectionist,
		},
		rules: {
			// Spreading recommended rules from plugins
			...tseslint.configs.recommendedTypeChecked.rules,
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,

			// TypeScript
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					vars: 'all',
					args: 'after-used',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^_',
					argsIgnorePattern: '^_',
				},
			],

			'unused-imports/no-unused-vars': 'off',

			'unused-imports/no-unused-imports': 'error',

			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/require-await': 'error',

			// React
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true, allowExportNames: ['layout', 'metadata'] },
			],
			'react/self-closing-comp': 'error',
			'react/jsx-no-useless-fragment': 'error',
			'react/react-in-jsx-scope': 'off',
			'react/no-array-index-key': 'error',
			'react/jsx-pascal-case': 'error',

			// Import order & organization
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],
			'import/newline-after-import': 'warn',
			'import/no-duplicates': 'error',
			'import/no-extraneous-dependencies': 'error',
			'import/no-cycle': 'error',

			'no-unreachable': 'error',

			// Unicorn
			'unicorn/filename-case': ['error', { case: 'camelCase', ignore: ['not-found.tsx'] }],
			'unicorn/no-useless-undefined': 'error',
			'unicorn/prefer-ternary': 'warn',
			'unicorn/no-array-for-each': 'warn',
			'unicorn/no-unreadable-iife': 'error',
			'unicorn/prefer-set-has': 'warn',
			'unicorn/prevent-abbreviations': 'off',

			// Next.js specific
			'@next/next/no-img-element': 'error',
			'@next/next/no-sync-scripts': 'warn',

			'perfectionist/sort-jsx-props': [
				'error',
				{
					type: 'alphabetical',
					order: 'asc',
					groups: ['className', 'unknown'],
					customGroups: [{ groupName: 'className', elementNamePattern: '^className$' }],
				},
			],
		},
	},
	{
		files: ['eslint.config.js'],
		languageOptions: {
			sourceType: 'module',
		},
	},
]);
