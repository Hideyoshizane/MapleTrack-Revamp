import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';

import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import-x';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
	// Global ignores
	{ ignores: ['.next/**', 'coverage/**', 'dist/**', 'eslint.config.js', 'node_modules/**'] },

	// Base JS recommended rules
	js.configs.recommended,

	// TypeScript recommended
	...tseslint.configs.recommendedTypeChecked,

	// React / Next.js recommended
	{
		plugins: {
			'@next/next': nextPlugin,
			'jsx-a11y': jsxA11yPlugin,
			'react-hooks': reactHooksPlugin,
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,
			...jsxA11yPlugin.configs.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
		},
	},

	{
		files: ['**/*.{js,jsx,ts,tsx}'],

		languageOptions: {
			parser: tseslint.parser,
			parserOptions: { projectService: true, tsconfigRootDir: __dirname },
		},

		settings: { 'import-x/resolver': { node: true, typescript: true }, react: { version: 'detect' } },

		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'import-x': importPlugin,
			react: reactPlugin,
			'react-refresh': reactRefreshPlugin,
			'unused-imports': unusedImportsPlugin,
		},

		rules: {
			// JavaScript
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'prefer-const': 'error',

			// TypeScript
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/switch-exhaustiveness-check': 'error',

			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					args: 'after-used',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					vars: 'all',
					varsIgnorePattern: '^_',
				},
			],

			// React
			'react/button-has-type': 'error',
			'react/jsx-no-useless-fragment': 'error',
			'react/no-array-index-key': 'error',
			'react/self-closing-comp': 'error',

			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true, allowExportNames: ['layout', 'metadata'] },
			],

			// Imports
			'import-x/first': 'error',
			'import-x/newline-after-import': 'warn',
			'import-x/no-cycle': 'error',
			'import-x/no-duplicates': 'error',
			'import-x/no-extraneous-dependencies': [
				'error',
				{ devDependencies: ['**/*.config.*', '**/*.spec.*', '**/*.test.*', 'eslint.config.*'] },
			],
			'import-x/order': [
				'error',
				{
					alphabetize: { caseInsensitive: true, order: 'asc' },
					groups: ['external', 'builtin', 'internal', 'parent', 'sibling', 'index', 'type'],
					pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
					'newlines-between': 'always',
				},
			],
		},
	},

	// Test files
	{
		files: ['**/*.{spec,test}.{ts,tsx}'],
		rules: { '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-non-null-assertion': 'off' },
	},
];
