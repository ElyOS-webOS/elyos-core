/**
 * ListFiles Remote Function
 * Requirements: 3.1, 3.2, 3.3, 3.4
 *
 * Fájlok listázása kategória és scope alapján.
 */

import { command, getRequestEvent } from '$app/server';
import { listFilesInputSchema } from './schemas.js';
import { fileRepository } from './file-repository.js';
import { StorageError } from './types.js';
import type { ListFilesResult } from './types.js';

// ============================================================================
// Remote Function
// ============================================================================

/**
 * Fájlok listázása kategória és scope alapján.
 *
 * Requirements:
 * - 3.1: Visszaadja az összes fájlt a kategória és scope alapján
 * - 3.2: User scope esetén csak a felhasználó fájljait adja vissza
 * - 3.3: Shared scope esetén minden shared fájlt visszaad a kategóriában
 * - 3.4: Metaadat visszaadása: id, filename, mimeType, size, createdAt
 *
 * @param input - A listázás paraméterei
 * @returns A listázás eredménye
 */
export const listFiles = command(listFilesInputSchema, async (input): Promise<ListFilesResult> => {
	const event = getRequestEvent();
	const { locals } = event;

	// Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
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
		// Fájlok lekérdezése a repository-ból
		// User scope esetén a userId-t is átadjuk a szűréshez
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
