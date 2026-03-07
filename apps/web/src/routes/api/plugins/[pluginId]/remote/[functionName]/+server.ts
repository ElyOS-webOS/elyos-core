/**
 * Remote Function Handler API Endpoint
 *
 * POST /api/plugins/:pluginId/remote/:functionName
 *
 * Task 9.7: Remote függvény hívás endpoint
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PluginErrorCode } from '@elyos/database';
import db from '$lib/server/database';
import { apps } from '@elyos/database';
import { eq } from 'drizzle-orm';
import path from 'path';

/**
 * Remote függvény végrehajtása
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const { pluginId, functionName } = params;

	try {
		// 1. Autentikáció ellenőrzés
		// TODO: Integrálni a meglévő auth rendszerrel
		// const user = locals.user;
		// if (!user) {
		// 	throw error(401, 'Unauthorized');
		// }

		// Átmeneti mock user
		const userId = 'user-123';

		// 2. Request body parsing
		const body = await request.json();
		const { params: functionParams } = body;

		// 3. Plugin ellenőrzés
		const pluginResult = await db
			.select({
				pluginStatus: apps.pluginStatus,
				appType: apps.appType,
				pluginPermissions: apps.pluginPermissions
			})
			.from(apps)
			.where(eq(apps.appId, pluginId))
			.limit(1);

		if (pluginResult.length === 0) {
			throw error(404, `${PluginErrorCode.PLUGIN_NOT_FOUND}: Plugin not found`);
		}

		const plugin = pluginResult[0];

		if (plugin.appType !== 'plugin') {
			throw error(400, 'Not a plugin application');
		}

		if (plugin.pluginStatus !== 'active') {
			throw error(403, `${PluginErrorCode.PLUGIN_INACTIVE}: Plugin is not active`);
		}

		// 4. Jogosultság ellenőrzés
		const permissions = (plugin.pluginPermissions as string[]) || [];
		if (!permissions.includes('remote_functions')) {
			throw error(
				403,
				`${PluginErrorCode.PERMISSION_DENIED}: Plugin does not have 'remote_functions' permission`
			);
		}

		// 5. Remote függvény betöltése és végrehajtása
		const result = await executeRemoteFunction(pluginId, functionName, functionParams, userId);

		// 6. Sikeres válasz
		return json({
			success: true,
			result
		});
	} catch (err) {
		console.error(`[RemoteFunctionHandler] Error executing ${functionName}:`, err);

		// Hiba kezelés
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // SvelteKit error
		}

		return json(
			{
				success: false,
				error: err instanceof Error ? err.message : 'Remote function execution failed'
			},
			{ status: 500 }
		);
	}
};

/**
 * Remote függvény végrehajtása
 */
async function executeRemoteFunction(
	pluginId: string,
	functionName: string,
	params: unknown,
	userId: string
): Promise<unknown> {
	try {
		// Plugin server könyvtár útvonala
		const pluginDir = path.join(process.cwd(), 'uploads', 'plugins', pluginId);
		const serverFunctionsPath = path.join(pluginDir, 'server', 'functions.js');

		// Dinamikus import a server függvényekhez
		const serverModule = await import(serverFunctionsPath);

		// Függvény ellenőrzés
		if (!serverModule[functionName] || typeof serverModule[functionName] !== 'function') {
			throw new Error(
				`${PluginErrorCode.REMOTE_ERROR}: Function '${functionName}' not found in plugin`
			);
		}

		// Execution context létrehozása
		const context = {
			pluginId,
			userId,
			db, // Adatbázis kapcsolat
			// TODO: További context adatok (permissions, stb.)
			permissions: []
		};

		// Függvény végrehajtása timeout-tal (30 másodperc)
		const result = await Promise.race([
			serverModule[functionName](params, context),
			new Promise((_, reject) =>
				setTimeout(
					() => reject(new Error(`${PluginErrorCode.REMOTE_CALL_TIMEOUT}: Function timeout`)),
					30000
				)
			)
		]);

		return result;
	} catch (err) {
		console.error(`[RemoteFunctionHandler] Execution error:`, err);

		if (err instanceof Error && err.message.includes('Cannot find module')) {
			throw new Error(
				`${PluginErrorCode.REMOTE_ERROR}: Server functions file not found for plugin`
			);
		}

		throw err;
	}
}
