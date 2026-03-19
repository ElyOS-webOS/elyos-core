/**
 * @module
 * TypeScript type definitions for the ElyOS SDK.
 *
 * Import types from this module for type-safe access to SDK services
 * without importing any runtime code.
 *
 * @example
 * ```ts
 * import type { WebOSSDKInterface, UIService } from '@elyos-dev/sdk/types';
 * ```
 */

// ─── Toast & Dialog ─────────────────────────────────────────────

/** Toast notification type */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/** Options for showing a dialog */
export interface DialogOptions {
	title: string;
	message: string;
	type?: 'info' | 'confirm' | 'prompt';
	defaultValue?: string;
	buttons?: DialogButton[];
}

/** A button in a dialog */
export interface DialogButton {
	label: string;
	action: string;
	primary?: boolean;
}

/** Result returned after a dialog is closed */
export interface DialogResult {
	action: string;
	value?: string;
}

// ─── Theme ──────────────────────────────────────────────────────

/** Current theme color palette */
export interface ThemeColors {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	foreground: string;
	muted: string;
	mutedForeground: string;
	border: string;
	input: string;
	ring: string;
	destructive: string;
	destructiveForeground: string;
}

// ─── Services ───────────────────────────────────────────────────

/** UI service — toasts, dialogs, theme, and UI components */
export interface UIService {
	/** Toast értesítés megjelenítése */
	toast(message: string, type?: ToastType, duration?: number): void;
	/** Dialógus megjelenítése (info, confirm, prompt) */
	dialog(options: DialogOptions): Promise<DialogResult>;
	/** WebOS UI komponensek elérése */
	components: WebOSComponents;
	/** Aktuális téma színek (CSS változókból) */
	theme: ThemeColors;
}

/** Options for remote function calls */
export interface CallOptions {
	timeout?: number;
}

/** Remote service — call server-side functions defined in your app's server/ directory */
export interface RemoteService {
	/** Szerver oldali függvény hívása (retry logikával) */
	call<T = unknown>(
		functionName: string,
		params?: Record<string, unknown>,
		options?: CallOptions
	): Promise<T>;
}

/** A database transaction */
export interface Transaction {
	query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
}

/** Data service — key-value storage and SQL queries */
export interface DataService {
	/** Kulcs-érték pár tárolása */
	set(key: string, value: unknown): Promise<void>;
	/** Kulcs-érték pár lekérdezése */
	get<T = unknown>(key: string): Promise<T | null>;
	/** Kulcs-érték pár törlése */
	delete(key: string): Promise<void>;
	/** SQL lekérdezés végrehajtása (csak a plugin saját sémájában) */
	query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
	/** Tranzakció végrehajtása */
	transaction<T = unknown>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}

/** Internationalization service — translations and locale switching */
export interface I18nService {
	/** Fordítási kulcs feloldása (paraméter interpolációval) */
	t(key: string, params?: Record<string, string | number>): string;
	/** Aktuális nyelv kódja */
	locale: string;
	/** Nyelv váltása és fordítások újratöltése */
	setLocale(locale: string): Promise<void>;
	/** Várja meg a fordítások betöltését */
	ready(): Promise<void>;
	/** Callback regisztrálása locale váltás után (fordítások betöltése után hívódik) */
	onLocaleChange(callback: () => void): void;
}

/** Options for sending a notification */
export interface NotificationOptions {
	userId: string;
	title: string;
	message: string;
	type?: ToastType;
}

/** Notification service — send notifications to users (requires `notifications` permission) */
export interface NotificationService {
	/** Értesítés küldése (jogosultság szükséges) */
	send(options: NotificationOptions): Promise<void>;
}

/** Authenticated user information */
export interface UserInfo {
	id: string;
	name: string;
	email: string;
	roles: string[];
	groups: string[];
}

/** Controls for the app's window */
export interface WindowControls {
	close(): void;
	setTitle(title: string): void;
}

/** Context service — app identity, user info, permissions, and window controls */
export interface ContextService {
	/** Plugin azonosítója */
	pluginId: string;
	/** Felhasználó információk */
	user: UserInfo;
	/** Átadott paraméterek */
	params: Record<string, unknown>;
	/** Plugin jogosultságai */
	permissions: string[];
	/** Ablak vezérlők (close, setTitle) */
	window: WindowControls;
}

/** Asset service — resolve URLs for bundled app assets */
export interface AssetService {
	/** Asset URL generálása (path traversal védelemmel) */
	getUrl(assetPath: string): string;
}

// ─── Components ─────────────────────────────────────────────────

/** ElyOS UI components exposed to apps */
export interface WebOSComponents {
	[key: string]: any;
}

// ─── SDK Main Interface ─────────────────────────────────────────

/** Main SDK interface — injected into `window.webOS` by ElyOS at runtime */
export interface WebOSSDKInterface {
	ui: UIService;
	remote: RemoteService;
	data: DataService;
	i18n: I18nService;
	notifications: NotificationService;
	context: ContextService;
	assets: AssetService;
	components: WebOSComponents;
}

// ─── Mock SDK Config ────────────────────────────────────────────

/** Configuration for the mock SDK used during standalone development */
export interface MockSDKConfig {
	ui?: Partial<UIService>;
	remote?: {
		handlers?: Record<string, (...args: unknown[]) => unknown>;
	};
	data?: {
		initialData?: Record<string, unknown>;
	};
	i18n?: {
		locale?: string;
		translations?: Record<string, Record<string, string>>;
	};
	notifications?: Partial<NotificationService>;
	context?: Partial<ContextService>;
	assets?: {
		baseUrl?: string;
	};
}

// ─── Error Codes ────────────────────────────────────────────────

/** Error codes thrown by SDK operations */
export enum PluginErrorCode {
	PERMISSION_DENIED = 'PERMISSION_DENIED',
	REMOTE_CALL_TIMEOUT = 'REMOTE_CALL_TIMEOUT',
	REMOTE_ERROR = 'REMOTE_ERROR',
	NETWORK_ERROR = 'NETWORK_ERROR',
	SERVER_ERROR = 'SERVER_ERROR',
	CLIENT_ERROR = 'CLIENT_ERROR'
}
