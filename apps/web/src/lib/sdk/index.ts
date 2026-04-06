/**
 * WebOS SDK Export
 *
 * Központi export fájl — az @elyos-dev/sdk package-ből re-exportálja az SDK-t.
 * Ez a fájl biztosítja a backward compatibility-t a $lib/sdk importokhoz.
 */

export { WebOSSDK } from '@elyos-dev/sdk';

// Service-ek exportálása
export { UIService } from '@elyos-dev/sdk';
export { RemoteService } from '@elyos-dev/sdk';
export { DataService } from '@elyos-dev/sdk';
export { I18nService } from '@elyos-dev/sdk';
export { NotificationService } from '@elyos-dev/sdk';
export { ContextService } from '@elyos-dev/sdk';
export { AssetService } from '@elyos-dev/sdk';

// Típusok re-exportálása az @elyos-dev/sdk-ból
export type {
	UserInfo,
	WindowControls,
	DialogOptions,
	DialogResult,
	ThemeColors,
	CallOptions,
	Transaction,
	SDKNotificationOptions,
	ToastType,
	WebOSComponents,
	WebOSSDKInterface,
	MockSDKConfig
} from '@elyos-dev/sdk';
