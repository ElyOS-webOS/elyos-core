/**
 * Upload Remote Function
 * Requirements: 8.2, 8.3
 *
 * SvelteKit remote function a fájlfeltöltés szerver oldali feldolgozásához.
 * A command pattern-t használja a projekt konvenciói szerint.
 */

import { command } from '$app/server';
import { uploadInputSchema } from './schemas.js';
import { validateMimeType, isImageMimeType } from './mime-validator.js';
import { processImage } from './image-processor.js';
import type { ProcessedFile, UploadResult } from './types.js';

// ============================================================================
// Hibakódok
// ============================================================================

const ERROR_CODES = {
	INVALID_MIME_TYPE: 'INVALID_MIME_TYPE',
	PROCESSING_ERROR: 'PROCESSING_ERROR',
	STORAGE_ERROR: 'STORAGE_ERROR',
	VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

// ============================================================================
// Segédfüggvények
// ============================================================================

/**
 * Egyedi azonosító generálása.
 */
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Base64 string dekódolása Buffer-ré.
 *
 * @param base64 - Base64 kódolt string
 * @returns Buffer
 */
function decodeBase64(base64: string): Buffer {
	// Eltávolítjuk a data URL prefixet ha van
	const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
	return Buffer.from(base64Data, 'base64');
}

/**
 * Buffer kódolása Base64 data URL-lé.
 *
 * @param buffer - Buffer
 * @param mimeType - MIME típus
 * @returns Base64 data URL
 */
function encodeToDataUrl(buffer: Buffer, mimeType: string): string {
	return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// ============================================================================
// Remote Function
// ============================================================================

/**
 * Fájl feltöltése és feldolgozása.
 *
 * Requirements: 8.2 - SvelteKit remote function command pattern-nel
 * Requirements: 8.3 - Valibot validáció
 *
 * @param input - A feltöltendő fájl adatai
 * @returns A feltöltés eredménye
 */
export const uploadFile = command(uploadInputSchema, async (input): Promise<UploadResult> => {
	const { fileData, fileName, mimeType, options } = input;

	try {
		// Base64 dekódolás
		const buffer = decodeBase64(fileData);
		const fileId = generateId();

		// MIME típus validáció - Requirements: 3.1, 3.2
		const mimeValidation = await validateMimeType(buffer, 'mixed', mimeType);

		if (!mimeValidation.valid) {
			return {
				success: false,
				error: mimeValidation.error || 'Invalid file type'
			};
		}

		const detectedMimeType = mimeValidation.detectedMimeType || mimeType;

		// Képfeldolgozás ha szükséges - Requirements: 4.1, 4.2
		if (isImageMimeType(detectedMimeType)) {
			const processedResult = await processImage(buffer, {
				maxWidth: options.maxImageWidth,
				maxHeight: options.maxImageHeight,
				generateThumbnail: options.generateThumbnail
			});

			const processedFile: ProcessedFile = {
				id: fileId,
				originalName: fileName,
				mimeType: processedResult.processed.mimeType,
				size: processedResult.processed.buffer.length,
				url: encodeToDataUrl(processedResult.processed.buffer, processedResult.processed.mimeType),
				dimensions: processedResult.processed.dimensions
			};

			// Bélyegkép hozzáadása ha generáltunk
			if (processedResult.thumbnail) {
				processedFile.thumbnailUrl = encodeToDataUrl(
					processedResult.thumbnail.buffer,
					processedResult.thumbnail.mimeType
				);
			}

			return {
				success: true,
				file: processedFile
			};
		}

		// Nem kép fájlok esetén egyszerű feldolgozás
		const processedFile: ProcessedFile = {
			id: fileId,
			originalName: fileName,
			mimeType: detectedMimeType,
			size: buffer.length,
			url: encodeToDataUrl(buffer, detectedMimeType)
		};

		return {
			success: true,
			file: processedFile
		};
	} catch (error) {
		console.error('[FileUploader] Upload error:', error);

		// Hibakezelés - strukturált hibaválasz
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

		return {
			success: false,
			error: errorMessage
		};
	}
});
