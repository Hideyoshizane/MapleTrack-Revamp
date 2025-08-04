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
	const [{ default: importPlugin }, { default: tsPlugin }, { default: unusedImportsPlugin }] = await Promise.all([
		import('eslint-plugin-import'),
		import('@typescript-eslint/eslint-plugin'),
		import('eslint-plugin-unused-imports'),
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
