/**
 * Storage modul exportok (kliens-elérhető)
 */

// Remote functions
export { saveFile } from './save-file.remote.js';
export { listFiles } from './list-files.remote.js';
export { deleteFile } from './delete-file.remote.js';

// Types
export type {
	FileScope,
	StoredFile,
	SaveFileInput,
	SaveFileOptions,
	SaveFileResult,
	ListFilesInput,
	ListFilesResult,
	DeleteFileInput,
	DeleteFileResult,
	GetFileMetadataInput,
	GetFileMetadataResult
} from './types.js';
