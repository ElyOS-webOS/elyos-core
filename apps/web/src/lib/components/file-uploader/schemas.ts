/**
 * File Uploader Valibot sémák
 * Requirements: 8.3
 */
import * as v from 'valibot';

/**
 * Upload opciók séma
 */
export const uploadOptionsSchema = v.object({
	generateThumbnail: v.boolean(),
	maxImageWidth: v.optional(v.pipe(v.number(), v.minValue(1))),
	maxImageHeight: v.optional(v.pipe(v.number(), v.minValue(1)))
});

/**
 * Upload input séma a szerver oldali validációhoz
 * Requirements: 8.3
 */
export const uploadInputSchema = v.object({
	fileData: v.pipe(v.string(), v.minLength(1, 'File data is required')),
	fileName: v.pipe(
		v.string(),
		v.minLength(1, 'File name is required'),
		v.maxLength(255, 'File name too long')
	),
	mimeType: v.pipe(v.string(), v.minLength(1, 'MIME type is required')),
	options: uploadOptionsSchema
});

/**
 * Upload input típus a sémából
 */
export type UploadInputSchema = v.InferOutput<typeof uploadInputSchema>;
