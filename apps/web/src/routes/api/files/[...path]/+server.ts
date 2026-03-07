/**
 * Files API Route - Fájlok biztonságos kiszolgálása
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 *
 * Route: /api/files/[...path]
 * - Session ellenőrzés
 * - Jogosultság ellenőrzés (shared vs user scope)
 * - Fájl kiszolgálás megfelelő Content-Type header-rel
 * - Cache-Control header beállítás
 */

import type { RequestHandler } from './$types';
import { auth } from '$lib/auth/index';
import { readFromFileSystem, validatePath } from '$lib/server/storage/filesystem';
import { StorageError, STORAGE_CONFIG, getHttpStatusForError } from '$lib/server/storage/types';

/**
 * Parse the path to extract category, scope, and filename
 * Expected format: {category}/{scope}/{filename}
 * Where scope is either "shared" or "user-{userId}"
 */
function parsePath(pathSegments: string[]): {
	category: string;
	scope: 'shared' | 'user';
	scopeUserId: number | null;
	filename: string;
	storagePath: string;
} | null {
	// Minimum 3 segments required: category, scope, filename
	if (pathSegments.length < 3) {
		return null;
	}

	const category = pathSegments[0];
	const scopeSegment = pathSegments[1];
	const filename = pathSegments.slice(2).join('/'); // Support nested filenames

	// Determine scope and userId from scope segment
	let scope: 'shared' | 'user';
	let scopeUserId: number | null = null;

	if (scopeSegment === 'shared') {
		scope = 'shared';
	} else if (scopeSegment.startsWith('user-')) {
		scope = 'user';
		const userIdStr = scopeSegment.slice(5); // Remove "user-" prefix
		scopeUserId = parseInt(userIdStr, 10);
		if (isNaN(scopeUserId)) {
			return null;
		}
	} else {
		return null;
	}

	// Construct storage path
	const storagePath = pathSegments.join('/');

	return {
		category,
		scope,
		scopeUserId,
		filename,
		storagePath
	};
}

/**
 * Create an error response with JSON body
 */
function errorResponse(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

/**
 * GET /api/files/[...path] - Serve a file
 */
export const GET: RequestHandler = async ({ params, request }) => {
	try {
		// 1. Session ellenőrzés (Requirements: 6.2, 6.3)
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session) {
			return errorResponse('Unauthorized', 401);
		}

		const userId = parseInt(session.user.id, 10);

		// 2. Path parsing és validálás
		const pathSegments = params.path?.split('/') ?? [];

		if (pathSegments.length === 0) {
			return errorResponse('Invalid path', 400);
		}

		const parsedPath = parsePath(pathSegments);

		if (!parsedPath) {
			return errorResponse('Invalid path format', 400);
		}

		const { scope, scopeUserId, storagePath } = parsedPath;

		// 3. Path traversal védelem (Requirements: 8.1)
		if (!validatePath(storagePath)) {
			return errorResponse('Invalid path', 400);
		}

		// 4. Jogosultság ellenőrzés (Requirements: 6.4, 6.5)
		// - Shared fájlok: bármely bejelentkezett felhasználó elérheti
		// - User fájlok: csak a tulajdonos érheti el
		// - Kivétel: avatars kategória esetén bármely bejelentkezett felhasználó elérheti
		if (scope === 'user' && scopeUserId !== userId) {
			// Avatars esetén engedjük a hozzáférést bármely bejelentkezett felhasználónak
			if (parsedPath.category !== 'avatars') {
				return errorResponse('Permission denied', 403);
			}
		}

		// 5. Fájl olvasása a fájlrendszerből
		let fileBuffer: Buffer;
		try {
			fileBuffer = await readFromFileSystem(storagePath);
		} catch (error) {
			if (error instanceof StorageError) {
				return errorResponse(error.message, getHttpStatusForError(error.code));
			}
			throw error;
		}

		// 6. MIME típus meghatározása
		// Próbáljuk az adatbázisból lekérni a pontos MIME típust
		let mimeType = 'application/octet-stream';

		// Keresés az adatbázisban a fájl metaadatai alapján
		// A storagePath alapján keresünk
		try {
			// A fájl metaadatait a storagePath alapján keressük
			// Mivel nincs közvetlen keresés storagePath alapján, a MIME típust
			// a fájl kiterjesztéséből határozzuk meg
			mimeType = getMimeTypeFromExtension(storagePath);
		} catch {
			// Ha nem sikerül, marad az alapértelmezett
		}

		// 7. Response összeállítása (Requirements: 6.6, 6.7)
		// Convert Buffer to Uint8Array for Response compatibility
		const responseBody = new Uint8Array(fileBuffer);

		return new Response(responseBody, {
			status: 200,
			headers: {
				'Content-Type': mimeType,
				'Content-Length': fileBuffer.length.toString(),
				'Cache-Control': `public, max-age=${STORAGE_CONFIG.cacheMaxAge}`,
				'X-Content-Type-Options': 'nosniff'
			}
		});
	} catch (error) {
		console.error('[Files API] Unexpected error:', error);

		if (error instanceof StorageError) {
			return errorResponse(error.message, getHttpStatusForError(error.code));
		}

		return errorResponse('Internal server error', 500);
	}
};

/**
 * Get MIME type from file extension
 */
function getMimeTypeFromExtension(filePath: string): string {
	const ext = filePath.split('.').pop()?.toLowerCase() ?? '';

	const mimeTypes: Record<string, string> = {
		// Images
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
		svg: 'image/svg+xml',
		ico: 'image/x-icon',
		bmp: 'image/bmp',

		// Documents
		pdf: 'application/pdf',
		doc: 'application/msword',
		docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		xls: 'application/vnd.ms-excel',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		ppt: 'application/vnd.ms-powerpoint',
		pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		txt: 'text/plain',
		csv: 'text/csv',
		rtf: 'application/rtf',

		// Archives
		zip: 'application/zip',
		rar: 'application/vnd.rar',
		'7z': 'application/x-7z-compressed',
		tar: 'application/x-tar',
		gz: 'application/gzip',

		// Audio
		mp3: 'audio/mpeg',
		wav: 'audio/wav',
		ogg: 'audio/ogg',
		m4a: 'audio/mp4',

		// Video
		mp4: 'video/mp4',
		webm: 'video/webm',
		avi: 'video/x-msvideo',
		mov: 'video/quicktime',
		mkv: 'video/x-matroska',

		// Other
		json: 'application/json',
		xml: 'application/xml',
		html: 'text/html',
		css: 'text/css',
		js: 'application/javascript'
	};

	return Object.hasOwn(mimeTypes, ext) ? mimeTypes[ext] : 'application/octet-stream';
}
