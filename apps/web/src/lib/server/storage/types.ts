/**
 * FileStorage szolgáltatás típusok és konstansok
 * Requirements: 2.6, 3.4, 4.1, 5.2
 */
import path from 'path';

// ============================================================================
// Scope típus
// ============================================================================

/** Fájl hozzáférési köre */
export type FileScope = 'shared' | 'user';

// ============================================================================
// Tárolt fájl interfész
// ============================================================================

/** Tárolt fájl adatai */
export interface StoredFile {
	/** Egyedi azonosító (publicId) */
	id: string;
	/** Tárolt fájlnév (lehet módosított az egyediség miatt) */
	filename: string;
	/** Eredeti fájlnév */
	originalName: string;
	/** Kategória */
	category: string;
	/** Scope */
	scope: FileScope;
	/** Tulajdonos user ID (user scope esetén) */
	userId: number | null;
	/** MIME típus */
	mimeType: string;
	/** Fájlméret bájtban */
	size: number;
	/** Tárolási útvonal */
	storagePath: string;
	/** Publikus URL a fájl eléréséhez */
	url: string;
	/** Bélyegkép URL (opcionális) */
	thumbnailUrl?: string;
	/** Létrehozás időpontja */
	createdAt: Date;
}

// ============================================================================
// SaveFile típusok
// ============================================================================

/** Fájl mentés feldolgozási opciók */
export interface SaveFileOptions {
	/** Bélyegkép generálás */
	generateThumbnail: boolean;
	/** Maximum képszélesség */
	maxImageWidth?: number;
	/** Maximum képmagasság */
	maxImageHeight?: number;
}

/** Fájl mentés input */
export interface SaveFileInput {
	/** Base64 kódolt fájl adat */
	fileData: string;
	/** Eredeti fájlnév */
	fileName: string;
	/** MIME típus */
	mimeType: string;
	/** Kategória */
	category: string;
	/** Scope */
	scope: FileScope;
	/** Feldolgozási opciók */
	options: SaveFileOptions;
}

/** Fájl mentés eredménye */
export interface SaveFileResult {
	/** Sikeres volt-e a mentés */
	success: boolean;
	/** Tárolt fájl adatai */
	file?: StoredFile;
	/** Hibaüzenet */
	error?: string;
}

// ============================================================================
// ListFiles típusok
// ============================================================================

/** Fájl listázás input */
export interface ListFilesInput {
	/** Kategória szűrő */
	category: string;
	/** Scope szűrő */
	scope: FileScope;
}

/** Fájl listázás eredménye */
export interface ListFilesResult {
	/** Sikeres volt-e a listázás */
	success: boolean;
	/** Fájlok listája */
	files: StoredFile[];
	/** Hibaüzenet */
	error?: string;
}

// ============================================================================
// DeleteFile típusok
// ============================================================================

/** Fájl törlés input */
export interface DeleteFileInput {
	/** Fájl azonosító (publicId) */
	fileId: string;
}

/** Fájl törlés eredménye */
export interface DeleteFileResult {
	/** Sikeres volt-e a törlés */
	success: boolean;
	/** Hibaüzenet */
	error?: string;
}

// ============================================================================
// GetFileMetadata típusok
// ============================================================================

/** Metaadat lekérés input */
export interface GetFileMetadataInput {
	/** Fájl azonosító (publicId) */
	fileId: string;
}

/** Metaadat lekérés eredménye */
export interface GetFileMetadataResult {
	/** Sikeres volt-e a lekérés */
	success: boolean;
	/** Fájl adatai */
	file?: StoredFile;
	/** Hibaüzenet */
	error?: string;
}

// ============================================================================
// Tárolási konfiguráció
// ============================================================================

/** Alapértelmezett tárolási konfiguráció */
export const STORAGE_CONFIG = {
	/**
	 * Uploads mappa neve
	 * A futtatási környezet gyökeréhez relatív (process.cwd())
	 * Deploymentkor ez az alkalmazás mappája mellett lesz
	 */
	uploadsDir: 'uploads',

	/** Maximum fájlnév hossz */
	maxFilenameLength: 255,

	/** Engedélyezett kategóriák (opcionális korlátozás) */
	allowedCategories: ['backgrounds', 'documents', 'avatars', 'images'],

	/** Cache-Control header értéke (1 óra) */
	cacheMaxAge: 3600
} as const;

/**
 * Uploads mappa abszolút útvonalának meghatározása
 * A process.cwd() a futtatási környezet gyökerét adja vissza
 */
export function getUploadsPath(): string {
	return path.join(process.cwd(), STORAGE_CONFIG.uploadsDir);
}

// ============================================================================
// Hibakódok és hibakezelés
// ============================================================================

/** Hibakódok */
export const STORAGE_ERROR_CODES = {
	FILE_NOT_FOUND: 'FILE_NOT_FOUND',
	PERMISSION_DENIED: 'PERMISSION_DENIED',
	INVALID_PATH: 'INVALID_PATH',
	STORAGE_ERROR: 'STORAGE_ERROR',
	INVALID_CATEGORY: 'INVALID_CATEGORY',
	UNAUTHORIZED: 'UNAUTHORIZED',
	VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

/** Hibakód típus */
export type StorageErrorCode = keyof typeof STORAGE_ERROR_CODES;

/** Egyedi hiba osztály a tárolási hibákhoz */
export class StorageError extends Error {
	constructor(
		message: string,
		public code: StorageErrorCode
	) {
		super(message);
		this.name = 'StorageError';
	}
}

/** HTTP státusz kód lekérése hibakód alapján */
export function getHttpStatusForError(code: StorageErrorCode): number {
	const statusMap: Record<StorageErrorCode, number> = {
		FILE_NOT_FOUND: 404,
		PERMISSION_DENIED: 403,
		INVALID_PATH: 400,
		STORAGE_ERROR: 500,
		INVALID_CATEGORY: 400,
		UNAUTHORIZED: 401,
		VALIDATION_ERROR: 400
	};
	return statusMap[code];
}
