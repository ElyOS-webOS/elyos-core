import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		plugins: {
			jsdoc: jsdoc
		},
		rules: {
			'jsdoc/check-access': 1, // Recommended
			'jsdoc/check-alignment': 1, // Recommended
			'jsdoc/check-indentation': 1,
			'jsdoc/check-line-alignment': 1,
			'jsdoc/check-param-names': 1, // Recommended
			'jsdoc/check-property-names': 1, // Recommended
			'jsdoc/check-tag-names': 1, // Recommended
			'jsdoc/check-types': 1, // Recommended
			'jsdoc/check-values': 1, // Recommended
			'jsdoc/empty-tags': 1, // Recommended
			'jsdoc/implements-on-classes': 1, // Recommended
			'jsdoc/multiline-blocks': 0, // Recommended
			'jsdoc/no-multi-asterisks': 1, // Recommended
			'jsdoc/no-undefined-types': 1, // Recommended
			'jsdoc/require-asterisk-prefix': 1,
			'jsdoc/require-description-complete-sentence': 1,
			'jsdoc/require-jsdoc': 1, // Recommended
			'jsdoc/require-param': 1, // Recommended
			'jsdoc/require-param-name': 1, // Recommended
			'jsdoc/require-param-type': 1, // Recommended
			'jsdoc/require-property': 1, // Recommended
			'jsdoc/require-property-description': 1, // Recommended
			'jsdoc/require-property-name': 1, // Recommended
			'jsdoc/require-property-type': 1, // Recommended
			'jsdoc/require-returns': 1, // Recommended
			'jsdoc/require-returns-check': 1, // Recommended
			'jsdoc/require-returns-type': 1, // Recommended
			'jsdoc/require-param-description': 1, // Recommended
			'jsdoc/require-returns-description': 1, // Recommended
			'jsdoc/require-yields': 1, // Recommended
			'jsdoc/require-yields-check': 1, // Recommended
			'jsdoc/valid-types': 1, // Recommended
			'jsdoc/check-examples': 0,
			'jsdoc/check-template-names': 0,
			'jsdoc/check-syntax': 0,
			'jsdoc/informative-docs': 0,
			'jsdoc/match-description': 0,
			'jsdoc/no-bad-blocks': 0,
			'jsdoc/no-blank-block-descriptions': 0,
			'jsdoc/no-defaults': 0,
			'jsdoc/no-missing-syntax': 0,
			'jsdoc/no-restricted-syntax': 0,
			'jsdoc/no-types': 0,
			'jsdoc/require-description': 0,
			'jsdoc/require-example': 0,
			'jsdoc/require-file-overview': 0,
			'jsdoc/require-hyphen-before-param-description': 0,
			'jsdoc/require-template': 0,
			'jsdoc/require-throws': 0,
			'jsdoc/sort-tags': 0,
			'jsdoc/tag-lines': 0,
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'function',
					format: ['camelCase']
				},
				{
					selector: 'method',
					format: ['camelCase']
				}
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
);
