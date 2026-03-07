import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';

const componentsDir = resolve(__dirname, 'src/components');
const hasComponents = existsSync(componentsDir);

const buildMode = process.env.BUILD_MODE || 'main';

let entry: string;
let fileName: string;

if (buildMode === 'components' && hasComponents) {
	const componentFile = process.env.COMPONENT_FILE;
	if (componentFile) {
		entry = resolve(componentsDir, componentFile);
		fileName = `components/${componentFile.replace('.svelte', '')}`;
	} else {
		throw new Error('COMPONENT_FILE environment variable is required for components build');
	}
} else {
	entry = 'src/main.ts';
	fileName = 'index';
}

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
			entry,
			name: 'HelloWorldPlugin',
			formats: ['iife']
		},
		rollupOptions: {
			output: {
				entryFileNames: `${fileName}.iife.js`,
				inlineDynamicImports: true
			}
		},
		outDir: 'dist',
		emptyOutDir: buildMode === 'main'
	}
});
