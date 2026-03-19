/**
 * Asset Service
 *
 * Generate URLs for plugin asset files.
 * URL format: /api/plugins/{plugin_id}/assets/{assetPath}
 */

import type { AssetService as IAssetService } from '../../types/index.js';

/** Asset service — generates URLs for plugin asset files with path traversal protection. */
export class AssetService implements IAssetService {
	private readonly pluginId: string;

	/** @param pluginId - Unique plugin identifier */
	constructor(pluginId: string) {
		this.pluginId = pluginId;
	}

	/**
	 * Generate an asset URL.
	 *
	 * @param assetPath - Asset file path (relative to the plugin's assets/ directory)
	 * @returns Full URL
	 */
	getUrl(assetPath: string): string {
		const sanitized = this.sanitizePath(assetPath);
		return `/api/plugins/${this.pluginId}/assets/${sanitized}`;
	}

	/** Sanitize path to prevent path traversal attacks */
	private sanitizePath(path: string): string {
		return path.replace(/\.\./g, '').replace(/^\/+/, '').replace(/\/+/g, '/');
	}
}
