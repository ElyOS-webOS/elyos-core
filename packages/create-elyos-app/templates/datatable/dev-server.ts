/**
 * Dev szerver a plugin fejlesztéshez.
 * Statikus fájlokat szolgál ki a projekt gyökeréből és a dist/ mappából,
 * hogy az ElyOS betölthesse az IIFE bundle-t és a manifest.json-t.
 *
 * Használat: bun dev-server.ts
 */

import { serve } from 'bun';
import { readFile } from 'fs/promises';
import { join, extname, resolve, normalize } from 'path';

const PORT = 5174;
const ROOT = import.meta.dir;

const MIME: Record<string, string> = {
	'.js': 'application/javascript',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.css': 'text/css',
	'.html': 'text/html'
};

serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		let pathname = url.pathname === '/' ? '/index.html' : url.pathname;

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': '*'
		};

		if (req.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		// Normalize and sanitize the pathname to prevent path traversal
		const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
		const searchPaths = [join(ROOT, 'dist', safePath), join(ROOT, safePath)];

		for (const filePath of searchPaths) {
			// Ensure the resolved path stays within ROOT
			const resolvedPath = resolve(filePath);
			if (!resolvedPath.startsWith(ROOT + '/') && resolvedPath !== ROOT) {
				return new Response('Forbidden', { status: 403, headers: corsHeaders });
			}

			try {
				const content = await readFile(resolvedPath);
				const ext = extname(resolvedPath);
				return new Response(content, {
					headers: {
						'Content-Type': MIME[ext] ?? 'application/octet-stream',
						...corsHeaders
					}
				});
			} catch {
				// Nem található, próbáljuk a következőt
			}
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	}
});

console.log(`[DevServer] Plugin dev szerver fut: http://localhost:${PORT}`);
console.log(`[DevServer] Futtasd párhuzamosan: bun run build --watch`);
