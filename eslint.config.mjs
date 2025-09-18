import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

import importPlugin from 'eslint-plugin-import';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import cssModulesPlugin from 'eslint-plugin-css-modules';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: { rules: {} } });

export default [
	{
		ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**'],
	},

	...compat.extends(
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:react-hooks/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'next/core-web-vitals'
	),

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
			import: importPlugin,
			'react-refresh': reactRefreshPlugin,
		},
		settings: {
			'import/resolver': {
				typescript: { project: './tsconfig.json' },
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',

			'@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
			'@typescript-eslint/prefer-optional-chain': 'warn',
			'@typescript-eslint/prefer-for-of': 'warn',
			'@typescript-eslint/naming-convention': ['error', { selector: 'typeLike', format: ['PascalCase'] }],
			'@typescript-eslint/no-duplicate-enum-values': 'error',
			'@typescript-eslint/no-unused-vars': 'off',

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

			'css-modules/no-unused-class': [2, { camelCase: true }],
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},

	{
		files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: {
			import: importPlugin,
			'unused-imports': unusedImportsPlugin,
			'css-modules': cssModulesPlugin,
		},
		settings: {
			'import/resolver': { typescript: { project: './tsconfig.json' } },
		},
		rules: {
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
			'css-modules/no-unused-class': [2, { camelCase: true }],
		},
	},

	{
		rules: {
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
];
