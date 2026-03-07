/**
 * Plugin Component Loading API
 *
 * Betölti egy plugin komponensét név alapján.
 */

import { json, error as svelteError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const GET: RequestHandler = async ({ params }) => {
	const { pluginId, componentName } = params;

	try {
		// Plugin komponens fájl elérési útja
		const componentPath = join(
			process.cwd(),
			'uploads',
			'plugins',
			pluginId,
			'dist',
			'components',
			`${componentName}.iife.js`
		);

		// Komponens kód beolvasása
		const code = await readFile(componentPath, 'utf-8');

		// JavaScript kód visszaadása
		return new Response(code, {
			headers: {
				'Content-Type': 'application/javascript',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (error) {
		console.error(`Failed to load plugin component ${pluginId}/${componentName}:`, error);
		throw svelteError(404, `Plugin component not found: ${componentName}`);
	}
};
