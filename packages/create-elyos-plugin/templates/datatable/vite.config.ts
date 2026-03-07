import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				runes: true
			}
		})
	],
	server: {
		port: 5174,
		cors: {
			origin: ['http://localhost:5173'],
			credentials: true
		}
	},
	build: {
		lib: {
			entry: 'src/main.ts',
			formats: ['iife'],
			name: 'Plugin',
			fileName: () => 'index.iife.js'
		},
		rollupOptions: {
			output: {
				inlineDynamicImports: true
			}
		}
	}
});
