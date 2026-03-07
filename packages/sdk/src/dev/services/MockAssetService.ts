/**
 * Mock Asset Service
 *
 * Mock asset URL generálás.
 */

import type { AssetService } from '../../types/index.js';

export interface MockAssetConfig {
	baseUrl?: string;
}

export class MockAssetService implements AssetService {
	private readonly baseUrl: string;

	constructor(config?: MockAssetConfig) {
		this.baseUrl = config?.baseUrl ?? '/assets';
	}

	getUrl(assetPath: string): string {
		const sanitized = assetPath.replace(/\.\./g, '').replace(/^\/+/, '');
		return `${this.baseUrl}/${sanitized}`;
	}
}
