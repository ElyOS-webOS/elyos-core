/**
 * Plugin Manager Type Definitions
 */

// ============================================================================
// Upload State
// ============================================================================

export type UploadStatus =
	| 'idle'
	| 'validating'
	| 'uploading'
	| 'installing'
	| 'completed'
	| 'error';

export interface UploadState {
	isDragging: boolean;
	isUploading: boolean;
	uploadProgress: number;
	selectedFile: File | null;
	error: string | null;
	success: UploadSuccessResult | null;
	currentStatus: UploadStatus;
}

// ============================================================================
// Upload Results
// ============================================================================

export interface UploadSuccessResult {
	pluginId: string;
	pluginName: string;
	version: string;
	warnings?: string[];
}

export interface UploadError {
	code: UploadErrorCode;
	message: string;
	details?: string[];
}

export type UploadErrorCode =
	| 'INVALID_EXTENSION'
	| 'FILE_TOO_LARGE'
	| 'VALIDATION_ERROR'
	| 'INSTALLATION_ERROR'
	| 'NETWORK_ERROR'
	| 'AUTH_ERROR'
	| 'UNKNOWN_ERROR';

// ============================================================================
// Validation
// ============================================================================

export interface ValidationConfig {
	maxFileSize: number; // 10 MB (10485760 bytes)
	allowedExtension: string; // '.raconapkg'
	allowedMimeTypes: string[]; // ['application/zip', 'application/x-zip-compressed', 'application/octet-stream']
}

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

// ============================================================================
// Upload History
// ============================================================================

export interface UploadHistoryItem {
	id: string;
	fileName: string;
	fileSize: number;
	timestamp: Date;
	status: 'success' | 'error';
	pluginId?: string;
	error?: string;
}

// ============================================================================
// Component Props
// ============================================================================

export interface PluginUploaderProps {
	onUploadSuccess?: (result: UploadSuccessResult) => void;
	onUploadError?: (error: UploadError) => void;
}

export interface UploadProgressProps {
	progress: number; // 0-100
	fileName: string;
	fileSize: number;
	status: UploadStatus;
}

export interface UploadStatusProps {
	type: 'success' | 'error' | 'warning';
	message: string;
	details?: string[];
	dismissible?: boolean;
	onDismiss?: () => void;
}

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION_CONFIG: ValidationConfig = {
	maxFileSize: 10 * 1024 * 1024, // 10 MB
	allowedExtension: '.raconapkg',
	allowedMimeTypes: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream']
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a file for upload
 * @param file - File to validate
 * @returns Validation result
 */
export function validateFile(file: File): ValidationResult {
	// Check file extension
	if (!file.name.endsWith(VALIDATION_CONFIG.allowedExtension)) {
		return {
			valid: false,
			error: `Only ${VALIDATION_CONFIG.allowedExtension} files are allowed`
		};
	}

	// Check file size
	if (file.size > VALIDATION_CONFIG.maxFileSize) {
		const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
		const maxSizeMB = (VALIDATION_CONFIG.maxFileSize / (1024 * 1024)).toFixed(0);
		return {
			valid: false,
			error: `File size exceeds ${maxSizeMB} MB limit (${sizeMB} MB)`
		};
	}

	return { valid: true };
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
