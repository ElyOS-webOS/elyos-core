/**
 * DeleteFile Remote Function (kliens-elérhető)
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * Fájl törlése a fájlrendszerből és metaadat törlése az adatbázisból.
 */

import { command, getRequestEvent } from '$app/server';
import { deleteFileInputSchema } from './schemas.js';
import { fileRepository } from '$lib/server/storage/file-repository.js';
import { deleteFromFileSystem } from '$lib/server/storage/filesystem.js';
import { StorageError } from '$lib/server/storage/types.js';
import type { DeleteFileResult } from './types.js';

// ============================================================================
// Remote Function
// ============================================================================

/**
 * Fájl törlése a fájlrendszerből és metaadat törlése az adatbázisból.
 *
 * @param input - A törlés paraméterei
 * @returns A törlés eredménye
 */
export const deleteFile = command(
	deleteFileInputSchema,
	async (input): Promise<DeleteFileResult> => {
		const event = getRequestEvent();
		const { locals } = event;

		if (!locals.user?.id) {
			return {
				success: false,
				error: 'User not authenticated'
			};
		}

		const { fileId } = input;
		const userId = parseInt(locals.user.id);

		try {
			const file = await fileRepository.findByPublicId(fileId);

			if (!file) {
				return {
					success: false,
					error: 'File not found'
				};
			}

			if (file.userId !== null && file.userId !== userId) {
				return {
					success: false,
					error: 'Permission denied: You can only delete your own files'
				};
			}

			if (file.scope === 'shared' && file.userId !== userId) {
				return {
					success: false,
					error: 'Permission denied: You can only delete files you uploaded'
				};
			}

			try {
				await deleteFromFileSystem(file.storagePath);
			} catch (error) {
				if (error instanceof StorageError && error.code === 'FILE_NOT_FOUND') {
					console.warn(
						`[FileStorage] File not found in filesystem, continuing with metadata deletion: ${file.storagePath}`
					);
				} else {
					throw error;
				}
			}

			if (file.thumbnailUrl) {
				const rawFile = await fileRepository.findRawByPublicId(fileId);
				if (rawFile?.thumbnailPath) {
					try {
						await deleteFromFileSystem(rawFile.thumbnailPath);
					} catch (error) {
						console.warn(`[FileStorage] Failed to delete thumbnail: ${rawFile.thumbnailPath}`);
					}
				}
			}

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
