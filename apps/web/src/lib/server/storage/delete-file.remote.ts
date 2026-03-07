/**
 * DeleteFile Remote Function
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * Fájl törlése a fájlrendszerből és metaadat törlése az adatbázisból.
 */

import { command, getRequestEvent } from '$app/server';
import { deleteFileInputSchema } from './schemas.js';
import { fileRepository } from './file-repository.js';
import { deleteFromFileSystem } from './filesystem.js';
import { StorageError, STORAGE_ERROR_CODES } from './types.js';
import type { DeleteFileResult } from './types.js';

// ============================================================================
// Remote Function
// ============================================================================

/**
 * Fájl törlése a fájlrendszerből és metaadat törlése az adatbázisból.
 *
 * Requirements:
 * - 4.1: Fájl törlése a fájlrendszerből
 * - 4.2: Metaadat törlése az adatbázisból
 * - 4.3: Shared fájl törlése engedélyezett ha a felhasználó a tulajdonos
 * - 4.4: Más felhasználó fájljának törlése elutasítva
 * - 4.5: Nem létező fájl esetén megfelelő hiba visszaadása
 *
 * @param input - A törlés paraméterei
 * @returns A törlés eredménye
 */
export const deleteFile = command(
	deleteFileInputSchema,
	async (input): Promise<DeleteFileResult> => {
		const event = getRequestEvent();
		const { locals } = event;

		// Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
		if (!locals.user?.id) {
			return {
				success: false,
				error: 'User not authenticated'
			};
		}

		const { fileId } = input;
		const userId = parseInt(locals.user.id);

		try {
			// Fájl metaadat lekérdezése
			const file = await fileRepository.findByPublicId(fileId);

			// Requirement 4.5: Nem létező fájl esetén hiba
			if (!file) {
				return {
					success: false,
					error: 'File not found'
				};
			}

			// Requirement 4.3, 4.4: Jogosultság ellenőrzés
			// A felhasználó csak a saját fájljait törölheti
			if (file.userId !== null && file.userId !== userId) {
				return {
					success: false,
					error: 'Permission denied: You can only delete your own files'
				};
			}

			// Shared fájlok esetén is ellenőrizzük a tulajdonost
			// (shared fájloknak is van userId-ja, aki feltöltötte)
			if (file.scope === 'shared' && file.userId !== userId) {
				return {
					success: false,
					error: 'Permission denied: You can only delete files you uploaded'
				};
			}

			// Requirement 4.1: Fájl törlése a fájlrendszerből
			try {
				await deleteFromFileSystem(file.storagePath);
			} catch (error) {
				// Ha a fájl nem található a fájlrendszerben, folytatjuk a metaadat törlésével
				if (error instanceof StorageError && error.code === 'FILE_NOT_FOUND') {
					console.warn(
						`[FileStorage] File not found in filesystem, continuing with metadata deletion: ${file.storagePath}`
					);
				} else {
					throw error;
				}
			}

			// Bélyegkép törlése ha van
			if (file.thumbnailUrl) {
				// A thumbnailUrl-ből kinyerjük a storage path-ot
				const rawFile = await fileRepository.findRawByPublicId(fileId);
				if (rawFile?.thumbnailPath) {
					try {
						await deleteFromFileSystem(rawFile.thumbnailPath);
					} catch (error) {
						// Bélyegkép törlési hiba nem kritikus
						console.warn(`[FileStorage] Failed to delete thumbnail: ${rawFile.thumbnailPath}`);
					}
				}
			}

			// Requirement 4.2: Metaadat törlése az adatbázisból
			const deleted = await fileRepository.delete(fileId);

			if (!deleted) {
				return {
					success: false,
					error: 'Failed to delete file metadata'
				};
			}

			return {
				success: true
			};
		} catch (error) {
			console.error('[FileStorage] Delete file error:', error);

			if (error instanceof StorageError) {
				return {
					success: false,
					error: error.message
				};
			}

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}
);
