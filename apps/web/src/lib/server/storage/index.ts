/**
 * FileStorage modul index
 * Requirements: 9.2
 *
 * Exportálja a remote function-öket és típusokat a storage modulból.
 */

// ============================================================================
// Remote Functions
// ============================================================================

export { saveFile } from './save-file.remote.js';
export { listFiles } from './list-files.remote.js';
export { deleteFile } from './delete-file.remote.js';
export { getFileMetadata } from './get-file-metadata.remote.js';

// ============================================================================
// Types
// ============================================================================

export type {
	FileScope,
	StoredFile,
	SaveFileOptions,
	SaveFileInput,
	SaveFileResult,
	ListFilesInput,
	ListFilesResult,
	DeleteFileInput,
	DeleteFileResult,
	GetFileMetadataInput,
	GetFileMetadataResult,
	StorageErrorCode
} from './types.js';

export {
	STORAGE_CONFIG,
	getUploadsPath,
	STORAGE_ERROR_CODES,
	StorageError,
	getHttpStatusForError
} from './types.js';

// ============================================================================
// Schemas
// ============================================================================

export {
	scopeSchema,
	categorySchema,
	fileIdSchema,
	saveFileOptionsSchema,
	saveFileInputSchema,
	listFilesInputSchema,
	deleteFileInputSchema,
	getFileMetadataInputSchema
} from './schemas.js';

export type {
	SaveFileInputSchema,
	ListFilesInputSchema,
	DeleteFileInputSchema,
	GetFileMetadataInputSchema
} from './schemas.js';
