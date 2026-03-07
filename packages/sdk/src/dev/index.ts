/**
 * @elyos/sdk/dev — Mock SDK fejlesztéshez
 *
 * Standalone plugin fejlesztéshez használható mock SDK.
 * Console-based feedback, localStorage-based storage.
 *
 * @example
 * ```ts
 * import { MockWebOSSDK } from '@elyos/sdk/dev';
 *
 * if (!window.webOS) {
 *   MockWebOSSDK.initialize();
 * }
 * ```
 */

export { MockWebOSSDK } from './MockWebOSSDK.js';
export { MockUIService } from './services/MockUIService.js';
export { MockRemoteService } from './services/MockRemoteService.js';
export { MockDataService } from './services/MockDataService.js';
export { MockI18nService } from './services/MockI18nService.js';
export { MockNotificationService } from './services/MockNotificationService.js';
export { MockContextService } from './services/MockContextService.js';
export { MockAssetService } from './services/MockAssetService.js';
