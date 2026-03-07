/**
 * Plugin Temp File Cleanup API Endpoint.
 *
 * DELETE /api/plugins/cleanup-temp
 *
 * Deletes a temporary plugin file.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';
import { PLUGIN_TEMP_DIR } from '$lib/server/plugins/config';

const TEMP_DIR = PLUGIN_TEMP_DIR;

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		// 1. Authentication check
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized - Authentication required');
		}

		// 2. Parse request body
		const body = await request.json();
		const { tempFile } = body;

		if (!tempFile) {
			throw error(400, 'Missing tempFile parameter');
		}

		// 3. Security check: ensure the temp file name contains the user ID
		const userId = locals.user.id;
		if (!tempFile.includes(`plugin-${userId}-`)) {
			throw error(403, 'Unauthorized access to temp file');
		}

		// 4. Delete temp file
		const tempFilePath = path.join(TEMP_DIR, tempFile);

		try {
			await fs.unlink(tempFilePath);
			console.log(`[PluginCleanup] Deleted temp file: ${tempFilePath}`);
		} catch (err) {
			// File might not exist, which is fine
			console.log(`[PluginCleanup] Temp file not found or already deleted: ${tempFilePath}`);
		}

		return json({
			success: true
		});
	} catch (err) {
		console.error('[PluginCleanup] Error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		return json(
			{
				success: false,
				error: err instanceof Error ? err.message : 'Cleanup failed'
			},
			{ status: 500 }
		);
	}
};
