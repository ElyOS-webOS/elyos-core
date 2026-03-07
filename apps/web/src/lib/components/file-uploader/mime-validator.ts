/**
 * MIME típus validáció szerver oldalon
 * Requirements: 3.1, 3.2, 3.3, 3.4
 *
 * A file-type csomagot használja a bináris tartalom alapú MIME típus detektáláshoz.
 */

import { fileTypeFromBuffer } from 'file-type';
import { MIME_TYPE_MAP, type FileType } from './types.js';

// ============================================================================
// Típusok
// ============================================================================

/** MIME detektálás eredménye */
export interface MimeDetectionResult {
	/** Detektált MIME típus (null ha nem sikerült) */
	mimeType: string | null;
	/** Detektált kiterjesztés (null ha nem sikerült) */
	extension: string | null;
}

/** MIME validáció eredménye */
export interface MimeValidationResult {
	/** Érvényes-e a MIME típus */
	valid: boolean;
	/** Detektált MIME típus */
	detectedMimeType: string | null;
	/** Hibaüzenet (ha van) */
	error?: string;
}

// ============================================================================
// MIME típus detektálás
// ============================================================================

/**
 * Detektálja a fájl MIME típusát a bináris tartalom alapján.
 *
 * @param buffer - A fájl bináris tartalma
 * @returns A detektált MIME típus és kiterjesztés
 *
 * Requirements: 3.4 - Dedikált MIME detektáló könyvtár használata
 */
export async function detectMimeType(buffer: Buffer | Uint8Array): Promise<MimeDetectionResult> {
	try {
		const result = await fileTypeFromBuffer(buffer);

		if (result) {
			return {
				mimeType: result.mime,
				extension: result.ext
			};
		}

		// Ha nem sikerült detektálni (pl. szöveges fájlok)
		return {
			mimeType: null,
			extension: null
		};
	} catch {
		return {
			mimeType: null,
			extension: null
		};
	}
}

// ============================================================================
// MIME típus validáció
// ============================================================================

/**
 * Visszaadja az engedélyezett MIME típusokat a fájl típus kategória alapján.
 *
 * @param fileType - A fájl típus kategória
 * @returns Az engedélyezett MIME típusok listája
 */
export function getAllowedMimeTypes(fileType: FileType): string[] {
	if (fileType === 'mixed') {
		// Mixed esetén minden image és document MIME típus engedélyezett
		return [...MIME_TYPE_MAP.image, ...MIME_TYPE_MAP.document];
	}

	return MIME_TYPE_MAP[fileType] || [];
}

/**
 * Ellenőrzi, hogy a detektált MIME típus megfelel-e az engedélyezett típusoknak.
 *
 * @param buffer - A fájl bináris tartalma
 * @param fileType - A fájl típus kategória
 * @param declaredMimeType - A kliens által deklarált MIME típus (opcionális)
 * @returns A validáció eredménye
 *
 * Requirements: 3.1 - MIME típus validáció bináris tartalom alapján
 * Requirements: 3.2 - Elutasítás ha nem egyezik az engedélyezett típusokkal
 * Requirements: 3.3 - Feldolgozás folytatása ha érvényes
 */
export async function validateMimeType(
	buffer: Buffer | Uint8Array,
	fileType: FileType,
	declaredMimeType?: string
): Promise<MimeValidationResult> {
	// Detektáljuk a tényleges MIME típust
	const detection = await detectMimeType(buffer);

	// Ha nem sikerült detektálni
	if (!detection.mimeType) {
		// Szöveges fájlok esetén (txt, csv) a file-type nem tud detektálni
		// Ilyenkor a deklarált MIME típust használjuk, ha az engedélyezett
		if (declaredMimeType) {
			const allowedTypes = getAllowedMimeTypes(fileType);
			const textTypes = ['text/plain', 'text/csv'];

			if (textTypes.includes(declaredMimeType) && allowedTypes.includes(declaredMimeType)) {
				return {
					valid: true,
					detectedMimeType: declaredMimeType
				};
			}
		}

		return {
			valid: false,
			detectedMimeType: null,
			error: 'Unable to detect file type'
		};
	}

	// Ellenőrizzük, hogy az engedélyezett típusok között van-e
	const allowedTypes = getAllowedMimeTypes(fileType);

	if (allowedTypes.length === 0) {
		// Ha nincs korlátozás (mixed üres listával), minden típus engedélyezett
		return {
			valid: true,
			detectedMimeType: detection.mimeType
		};
	}

	if (!allowedTypes.includes(detection.mimeType)) {
		return {
			valid: false,
			detectedMimeType: detection.mimeType,
			error: `File type '${detection.mimeType}' is not allowed for category '${fileType}'`
		};
	}

	return {
		valid: true,
		detectedMimeType: detection.mimeType
	};
}

/**
 * Ellenőrzi, hogy egy MIME típus kép típusú-e.
 *
 * @param mimeType - A MIME típus
 * @returns true ha kép típusú
 */
export function isImageMimeType(mimeType: string): boolean {
	return MIME_TYPE_MAP.image.includes(mimeType);
}

/**
 * Ellenőrzi, hogy egy MIME típus dokumentum típusú-e.
 *
 * @param mimeType - A MIME típus
 * @returns true ha dokumentum típusú
 */
export function isDocumentMimeType(mimeType: string): boolean {
	return MIME_TYPE_MAP.document.includes(mimeType);
}
