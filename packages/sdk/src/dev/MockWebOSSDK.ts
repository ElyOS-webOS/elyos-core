/**
 * MockWebOSSDK — Development Mock SDK
 *
 * Standalone plugin fejlesztéshez használható mock SDK.
 * Console-based feedback, localStorage-based storage.
 *
 * @example
 * ```ts
 * import { MockWebOSSDK } from '@elyos/sdk/dev';
 *
 * if (!window.webOS) {
 *   MockWebOSSDK.initialize({
 *     i18n: {
 *       locale: 'hu',
 *       translations: {
 *         hu: { title: 'Szia Világ' },
 *         en: { title: 'Hello World' }
 *       }
 *     }
 *   });
 * }
 * ```
 */

import type { MockSDKConfig, WebOSSDKInterface } from '../types/index.js';
import { MockUIService } from './services/MockUIService.js';
import { MockRemoteService } from './services/MockRemoteService.js';
import { MockDataService } from './services/MockDataService.js';
import { MockI18nService } from './services/MockI18nService.js';
import { MockNotificationService } from './services/MockNotificationService.js';
import { MockContextService } from './services/MockContextService.js';
import { MockAssetService } from './services/MockAssetService.js';

export class MockWebOSSDK implements WebOSSDKInterface {
	readonly ui: MockUIService;
	readonly remote: MockRemoteService;
	readonly data: MockDataService;
	readonly i18n: MockI18nService;
	readonly notifications: MockNotificationService;
	readonly context: MockContextService;
	readonly assets: MockAssetService;
	readonly components: WebOSSDKInterface['components'];

	constructor(config?: MockSDKConfig) {
		this.ui = new MockUIService();
		this.remote = new MockRemoteService(config?.remote);
		this.data = new MockDataService(config?.data);
		this.i18n = new MockI18nService(config?.i18n);
		this.notifications = new MockNotificationService();
		this.context = new MockContextService(
			config?.context as ConstructorParameters<typeof MockContextService>[0]
		);
		this.assets = new MockAssetService(config?.assets);
		this.components = {};
	}

	static initialize(config?: MockSDKConfig): MockWebOSSDK {
		const sdk = new MockWebOSSDK(config);

		if (typeof window !== 'undefined') {
			(window as Window).webOS = sdk;
		}

		console.log('[MockWebOSSDK] Initialized in development mode');
		return sdk;
	}
}
