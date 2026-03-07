/**
 * @elyos/sdk — ElyOS Plugin SDK
 *
 * Runtime SDK az ElyOS pluginokhoz.
 * A WebOSSDK osztályt az ElyOS core injektálja a pluginokba.
 *
 * @example
 * ```ts
 * import { WebOSSDK } from '@elyos/sdk';
 *
 * const sdk = WebOSSDK.initialize('my-plugin', user, params, permissions);
 * sdk.ui.toast('Hello from my plugin!', 'success');
 * ```
 */

export { WebOSSDK } from './runtime/WebOSSDK.js';
export { UIService } from './runtime/services/UIService.js';
export { RemoteService } from './runtime/services/RemoteService.js';
export { DataService } from './runtime/services/DataService.js';
export { I18nService } from './runtime/services/I18nService.js';
export { NotificationService } from './runtime/services/NotificationService.js';
export { ContextService } from './runtime/services/ContextService.js';
export { AssetService } from './runtime/services/AssetService.js';

export { PluginErrorCode } from './types/index.js';

export type {
	UIService as IUIService,
	RemoteService as IRemoteService,
	DataService as IDataService,
	I18nService as II18nService,
	NotificationService as INotificationService,
	ContextService as IContextService,
	AssetService as IAssetService,
	DialogOptions,
	DialogButton,
	DialogResult,
	ThemeColors,
	ToastType,
	CallOptions,
	Transaction,
	NotificationOptions as SDKNotificationOptions,
	UserInfo,
	WindowControls,
	WebOSComponents,
	WebOSSDKInterface,
	MockSDKConfig
} from './types/index.js';
