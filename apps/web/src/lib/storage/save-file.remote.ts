/**
 * SaveFile Remote Function (kliens-elérhető)
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 *
 * Fájl mentése a fájlrendszerbe és metaadat tárolása az adatbázisban.
 */

import { command, getRequestEvent } from '$app/server';
import { randomUUID } from 'crypto';
import { saveFileInputSchema } from './schemas.js';
import { saveToFileSystem } from '$lib/server/storage/filesystem.js';
import { fileRepository } from '$lib/server/storage/file-repository.js';
import { StorageError } from '$lib/server/storage/types.js';
import type { SaveFileResult } from './types.js';
import { validateMimeType, isImageMimeType } from '$lib/components/file-uploader/mime-validator.js';
import { processImage } from '$lib/components/file-uploader/image-processor.js';

// ============================================================================
// Segédfüggvények
// ============================================================================

/**
 * Base64 string dekódolása Buffer-ré.
 * @param base64 - Base64 kódolt string.
 * @returns Buffer.
 */
function decodeBase64(base64: string): Buffer {
	const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
	return Buffer.from(base64Data, 'base64');
}

// ============================================================================
// Remote Function
// ============================================================================

/**
 * Fájl mentése a fájlrendszerbe és metaadat tárolása az adatbázisban.
 *
 * @param input - A mentendő fájl adatai.
 * @returns A mentés eredménye.
 */
export const saveFile = command(saveFileInputSchema, async (input): Promise<SaveFileResult> => {
	const event = getRequestEvent();
	const { locals } = event;

	if (!locals.user?.id) {
		return {
			success: false,
			error: 'User not authenticated'
		};
	}

	const { fileData, fileName, mimeType, category, scope, options } = input;
	const userId = parseInt(locals.user.id);

	try {
		const buffer = decodeBase64(fileData);

		const mimeValidation = await validateMimeType(buffer, 'mixed', mimeType);
		if (!mimeValidation.valid) {
			return {
				success: false,
				error: mimeValidation.error || 'Invalid file type'
			};
		}

		const detectedMimeType = mimeValidation.detectedMimeType || mimeType;

		let processedBuffer = buffer;
		let processedMimeType = detectedMimeType;
		let thumbnailPath: string | undefined;

		if (isImageMimeType(detectedMimeType)) {
			const processedResult = await processImage(buffer, {
				maxWidth: options.maxImageWidth,
				maxHeight: options.maxImageHeight,
				generateThumbnail: options.generateThumbnail
			});

			processedBuffer = processedResult.processed.buffer;
			processedMimeType = processedResult.processed.mimeType;

			if (processedResult.thumbnail && options.generateThumbnail) {
				const thumbFilename = `thumb-${fileName}`;
				const thumbResult = await saveToFileSystem(
					processedResult.thumbnail.buffer,
					category,
					scope,
					thumbFilename,
					scope === 'user' ? userId : null
				);
				thumbnailPath = thumbResult.path;
			}
		}

		const fileResult = await saveToFileSystem(
			processedBuffer,
			category,
			scope,
			fileName,
			scope === 'user' ? userId : null
		);

		const publicId = randomUUID();

		const storedFile = await fileRepository.create({
			publicId,
			filename: fileResult.filename,
			originalName: fileName,
			category,
			scope,
			userId: scope === 'user' ? userId : null,
			mimeType: processedMimeType,
			size: processedBuffer.length,
			storagePath: fileResult.path,
			thumbnailPath: thumbnailPath || null
		});

		return {
			success: true,
			file: storedFile
		};
	} catch (error) {
		console.error('[FileStorage] Save file error:', error);

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
});
