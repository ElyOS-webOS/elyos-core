/**
 * File Uploader modul exportok
 * Requirements: 8.4
 */

// Komponens export
export { default as FileUploader } from './FileUploader.svelte';

// Típus exportok
export type {
	FileType,
	FileStatus,
	ProcessedFile,
	UploadResult,
	UploadError,
	FileItem,
	UploadState,
	FileUploaderProps,
	ValidationError,
	ValidationResult,
	ClientValidationConfig,
	UploadOptions,
	UploadInput,
	UploaderMode
} from './types.js';

// Konstans exportok
export { FILE_TYPE_EXTENSIONS, MIME_TYPE_MAP, DEFAULT_CONFIG, THUMBNAIL_CONFIG } from './types.js';
