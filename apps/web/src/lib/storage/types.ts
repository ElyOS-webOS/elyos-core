/**
 * FileStorage szolgáltatás típusok (kliens-elérhető)
 * Requirements: 2.6, 3.4, 4.1, 5.2
 */

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
