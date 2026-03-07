/**
 * Plugin Menu API
 *
 * Betölti egy plugin menu.json fájlját.
 */

import { json, error as svelteError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const GET: RequestHandler = async ({ params }) => {
	const { pluginId } = params;

	try {
		// Plugin menu.json fájl elérési útja
		const menuPath = join(process.cwd(), 'uploads', 'plugins', pluginId, 'menu.json');

		// Menu fájl beolvasása
		const menuContent = await readFile(menuPath, 'utf-8');
		const menuData = JSON.parse(menuContent);

		return json({
			success: true,
			menu: menuData
		});
	} catch (error) {
		// Ha nincs menu.json, üres menüt adunk vissza
		console.warn(`No menu.json found for plugin ${pluginId}`);
		return json({
			success: true,
			menu: []
		});
	}
};
