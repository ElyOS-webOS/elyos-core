import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		experimental: {
			remoteFunctions: true
		},
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$routes: './src/routes/*',
			$root: './',
			$apps: './src/apps'
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	},

	// CSS warningok szűrése
	onwarn: (warning, handler) => {
		// Tailwind @apply direktíva warningok figyelmen kívül hagyása
		if (warning.message && warning.message.includes('@apply')) return;

		// Minden más warningot továbbít
		handler(warning);
	}
};

export default config;
