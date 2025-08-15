import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Required for ESLint v9+
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: {
		rules: {},
	},
});

// Dynamically import plugins because `require()` doesn't work in .mjs
const eslintConfig = async () => {
	const [
		{ default: importPlugin },
		{ default: tsPlugin },
		{ default: unusedImportsPlugin },
		{ default: cssModulesPlugin },
	] = await Promise.all([
		import('eslint-plugin-import'),
		import('@typescript-eslint/eslint-plugin'),
		import('eslint-plugin-unused-imports'),
		import('eslint-plugin-css-modules'),
	]);

	return [
		{
			ignores: ['.next/**'],
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

		// Apply TypeScript parser and project only to TS/TSX files
		{
			files: ['**/*.ts', '**/*.tsx'],
			languageOptions: {
				parser: (await import('@typescript-eslint/parser')).default,
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
			},
			settings: {
				'import/resolver': {
					typescript: {
						project: './tsconfig.json',
					},
				},
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

		// For JS/JSX files, fallback to default parser (or no parser)
		{
			files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
			languageOptions: {
				// no TS parser here, use ESLint default
			},
			plugins: {
				import: importPlugin,
				'unused-imports': unusedImportsPlugin,
				'css-modules': cssModulesPlugin,
			},
			settings: {
				'import/resolver': {
					typescript: {
						project: './tsconfig.json',
					},
				},
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

		// Your other rules...
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
			},
		},
	];
};

export default eslintConfig();
