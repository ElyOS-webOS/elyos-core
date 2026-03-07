/**
 * ListFiles Remote Function (kliens-elérhető)
 * Requirements: 3.1, 3.2, 3.3, 3.4
 *
 * Fájlok listázása kategória és scope alapján.
 */

import { command, getRequestEvent } from '$app/server';
import { listFilesInputSchema } from './schemas.js';
import { fileRepository } from '$lib/server/storage/file-repository.js';
import { StorageError } from '$lib/server/storage/types.js';
import type { ListFilesResult } from './types.js';

// ============================================================================
// Remote Function
// ============================================================================

/**
 * Fájlok listázása kategória és scope alapján.
 *
 * @param input - A listázás paraméterei
 * @returns A listázás eredménye
 */
export const listFiles = command(listFilesInputSchema, async (input): Promise<ListFilesResult> => {
	const event = getRequestEvent();
	const { locals } = event;

	if (!locals.user?.id) {
		return {
			success: false,
			files: [],
			error: 'User not authenticated'
		};
	}

	const { category, scope } = input;
	const userId = parseInt(locals.user.id);

	try {
		const files = await fileRepository.findByCategory(
			category,
			scope,
			scope === 'user' ? userId : undefined
		);

		return {
			success: true,
			files
		};
	} catch (error) {
		console.error('[FileStorage] List files error:', error);

		if (error instanceof StorageError) {
			return {
				success: false,
				files: [],
				error: error.message
			};
		}

		return {
			success: false,
			files: [],
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
});
