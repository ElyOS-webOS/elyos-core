/**
 * Kliens oldali validációs függvények
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import {
	type ValidationResult,
	type ValidationError,
	type ClientValidationConfig,
	type FileType,
	FILE_TYPE_EXTENSIONS,
	DEFAULT_CONFIG
} from './types';

// ============================================================================
// Hibakódok és üzenetek
// ============================================================================

/** Validációs hibakódok */
export const VALIDATION_ERROR_CODES = {
	INVALID_EXTENSION: 'INVALID_EXTENSION',
	FILE_TOO_LARGE: 'FILE_TOO_LARGE',
	TOO_MANY_FILES: 'TOO_MANY_FILES'
} as const;

/** Lokalizált hibaüzenetek */
export const ERROR_MESSAGES: Record<string, string> = {
	[VALIDATION_ERROR_CODES.INVALID_EXTENSION]: 'A fájl típusa nem engedélyezett',
	[VALIDATION_ERROR_CODES.FILE_TOO_LARGE]: 'A fájl mérete meghaladja a megengedett limitet',
	[VALIDATION_ERROR_CODES.TOO_MANY_FILES]: 'Túl sok fájl lett kiválasztva'
};

// ============================================================================
// Segédfüggvények
// ============================================================================

/**
 * Fájl kiterjesztésének kinyerése
 * @param fileName - Fájlnév
 * @returns Kiterjesztés kisbetűvel, vagy üres string ha nincs
 */
export function getFileExtension(fileName: string): string {
	const lastDotIndex = fileName.lastIndexOf('.');
	if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
		return '';
	}
	return fileName.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Engedélyezett kiterjesztések meghatározása a konfiguráció alapján
 * @param allowedExtensions - Explicit engedélyezett kiterjesztések
 * @param fileType - Fájl típus kategória
 * @returns Engedélyezett kiterjesztések listája
 */
export function getAllowedExtensions(allowedExtensions: string[], fileType: FileType): string[] {
	// Ha explicit kiterjesztések vannak megadva, azokat használjuk
	if (allowedExtensions.length > 0) {
		return allowedExtensions.map((ext) => ext.toLowerCase());
	}

	// Ha mixed típus és nincs explicit lista, minden engedélyezett
	if (fileType === 'mixed') {
		return [];
	}

	// Egyébként a típus alapján határozzuk meg
	return FILE_TYPE_EXTENSIONS[fileType] || [];
}

// ============================================================================
// Validációs függvények
// ============================================================================

/**
 * Fájl kiterjesztés validálása
 * Requirements: 2.1
 *
 * @param fileName - Fájlnév
 * @param allowedExtensions - Engedélyezett kiterjesztések listája (üres = minden engedélyezett)
 * @returns true ha a kiterjesztés engedélyezett, false egyébként
 */
export function validateExtension(fileName: string, allowedExtensions: string[]): boolean {
	// Ha nincs megadva engedélyezett kiterjesztés, minden engedélyezett
	if (allowedExtensions.length === 0) {
		return true;
	}

	const extension = getFileExtension(fileName);

	// Ha nincs kiterjesztés, nem engedélyezett
	if (extension === '') {
		return false;
	}

	// Ellenőrizzük, hogy a kiterjesztés szerepel-e az engedélyezett listában
	const normalizedAllowed = allowedExtensions.map((ext) => ext.toLowerCase());
	return normalizedAllowed.includes(extension);
}

/**
 * Fájl méret validálása
 * Requirements: 2.2
 *
 * @param fileSize - Fájl mérete bájtban
 * @param maxFileSize - Maximum engedélyezett méret bájtban
 * @returns true ha a méret megfelelő, false egyébként
 */
export function validateFileSize(fileSize: number, maxFileSize: number): boolean {
	return fileSize <= maxFileSize;
}

/**
 * Fájlok számának validálása
 * Requirements: 2.3
 *
 * @param fileCount - Fájlok száma
 * @param maxFiles - Maximum engedélyezett fájlszám
 * @returns true ha a szám megfelelő, false egyébként
 */
export function validateFileCount(fileCount: number, maxFiles: number): boolean {
	return fileCount <= maxFiles;
}

/**
 * Egyetlen fájl validálása
 * @param file - Fájl objektum
 * @param config - Validációs konfiguráció
 * @returns Validációs hibák listája (üres ha érvényes)
 */
export function validateSingleFile(file: File, config: ClientValidationConfig): ValidationError[] {
	const errors: ValidationError[] = [];
	const allowedExtensions = getAllowedExtensions(config.allowedExtensions, config.fileType);

	// Kiterjesztés validálás
	if (!validateExtension(file.name, allowedExtensions)) {
		errors.push({
			code: VALIDATION_ERROR_CODES.INVALID_EXTENSION,
			message: ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_EXTENSION],
			field: file.name
		});
	}

	// Méret validálás
	if (!validateFileSize(file.size, config.maxFileSize)) {
		errors.push({
			code: VALIDATION_ERROR_CODES.FILE_TOO_LARGE,
			message: ERROR_MESSAGES[VALIDATION_ERROR_CODES.FILE_TOO_LARGE],
			field: file.name
		});
	}

	return errors;
}

/**
 * Progress érték validálása
 * Requirements: 5.2
 *
 * A progress értéknek MINDIG 0 és 100 között kell lennie (inkluzív).
 *
 * @param progress - Progress érték
 * @returns true ha a progress érték érvényes (0-100), false egyébként
 */
export function validateProgress(progress: number): boolean {
	return progress >= 0 && progress <= 100;
}

/**
 * Progress érték normalizálása a 0-100 tartományba
 * Requirements: 5.2
 *
 * @param progress - Progress érték
 * @returns Normalizált progress érték (0-100)
 */
export function normalizeProgress(progress: number): number {
	if (progress < 0) return 0;
	if (progress > 100) return 100;
	return progress;
}

/**
 * Fájlok validálása (wrapper függvény)
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 *
 * @param files - Fájlok listája
 * @param config - Validációs konfiguráció (opcionális, alapértelmezett értékekkel)
 * @returns Validációs eredmény
 */
export function validateFiles(
	files: File[],
	config: Partial<ClientValidationConfig> = {}
): ValidationResult {
	const fullConfig: ClientValidationConfig = {
		maxFileSize: config.maxFileSize ?? DEFAULT_CONFIG.maxFileSize,
		maxFiles: config.maxFiles ?? DEFAULT_CONFIG.maxFiles,
		allowedExtensions: config.allowedExtensions ?? DEFAULT_CONFIG.allowedExtensions,
		fileType: config.fileType ?? DEFAULT_CONFIG.fileType
	};

	const errors: ValidationError[] = [];

	// Fájlszám validálás
	if (!validateFileCount(files.length, fullConfig.maxFiles)) {
		errors.push({
			code: VALIDATION_ERROR_CODES.TOO_MANY_FILES,
			message: ERROR_MESSAGES[VALIDATION_ERROR_CODES.TOO_MANY_FILES]
		});
	}

	// Egyedi fájlok validálása
	for (const file of files) {
		const fileErrors = validateSingleFile(file, fullConfig);
		errors.push(...fileErrors);
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
