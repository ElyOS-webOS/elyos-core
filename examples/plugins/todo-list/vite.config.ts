import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				runes: true,
				customElement: true,
				css: 'injected'
			}
		})
	],
	build: {
		lib: {
			entry: 'src/main.ts',
			name: 'TodoListPlugin',
			formats: ['iife']
		},
		rollupOptions: {
			output: {
				entryFileNames: 'index.iife.js',
				inlineDynamicImports: true
			}
		},
		outDir: 'dist',
		emptyOutDir: true
	}
});
