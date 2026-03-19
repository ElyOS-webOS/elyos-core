/**
 * I18n Service
 *
 * Plugin translation management.
 * Keys are automatically namespaced under plugin:{plugin_id}.
 */

import type { I18nService as II18nService } from '../../types/index.js';

/** I18n service — plugin translation management, locale detection and switching. */
export class I18nService implements II18nService {
	/** @internal Plugin identifier used to namespace translation keys */
	private readonly pluginId: string;
	/** @internal In-memory translation map for the current locale */
	private translations: Map<string, string> = new Map();
	/** @internal Cu
	private _locale: string = 'en';
	/** @internal Promise that resolves when translations have finished loading */
	private loadingPromise: Promise<void> | null = null;
	/** @internal Listener for the ElyOS locale-change custom event */
	private storageListener: ((e: StorageEvent) => void) | null = null;
	/** @internal Registered callbacks to invoke after each locale change */
	private _onLocaleChangeCallbacks: Array<() => void> = [];

	/**
	 * @param pluginId - Unique plugin identifier
	 * @param skipAutoLoad - If `true`, skips automatic translation loading (for dev mode)
	 */
	constructor(pluginId: string, skipAutoLoad = false) {
		this.pluginId = pluginId;
		this.detectLocale();
		if (!skipAutoLoad) {
			this.loadingPromise = this.loadTranslations();
		}
		this.listenForLocaleChanges();
	}

	/**
	 * Register a callback to be called after each locale change.
	 * Multiple callbacks can be registered — all are called after translations finish loading.
	 * @param callback - Function to call after locale change
	 */
	onLocaleChange(callback: () => void): void {
		this._onLocaleChangeCallbacks.push(callback);
	}

	/** @internal Listen for system-level locale changes (ElyOS CustomEvent) */
	private listenForLocaleChanges(): void {
		if (typeof window === 'undefined') return;

		this.storageListener = ((e: Event) => {
			const detail = (e as CustomEvent<{ locale: string }>).detail;
			if (detail?.locale && detail.locale !== this._locale) {
				this._locale = detail.locale;
				this.translations.clear();
				this.loadingPromise = this.loadTranslations().then(() => {
					this._onLocaleChangeCallbacks.forEach((cb) => cb());
				});
			}
		}) as (e: StorageEvent) => void;

		window.addEventListener('elyos:locale-change', this.storageListener as EventListener);
	}

	/** Remove the locale change listener — call this when the plugin unmounts. */
	destroy(): void {
		if (this.storageListener && typeof window !== 'undefined') {
			window.removeEventListener('elyos:locale-change', this.storageListener as EventListener);
			this.storageListener = null;
		}
	}

	/** @internal Detect the current locale from the ElyOS `elyos_locale` cookie */
	private detectLocale(): void {
		if (typeof document !== 'undefined') {
			const match = document.cookie.match(/(?:^|;\s*)elyos_locale=([^;]+)/);
			if (match?.[1]) {
				this._locale = decodeURIComponent(match[1]);
				return;
			}
		}
		if (typeof navigator !== 'undefined') {
			this._locale = navigator.language.split('-')[0] ?? 'en';
		}
	}

	/**
	 * Load translations directly from an object (for dev mode).
	 * Called by the ElyOS core when loading a dev plugin.
	 * @param translations - Translation key-value pairs
	 */
	loadTranslationsFromObject(translations: Record<string, string>): void {
		this.translations.clear();
		for (const [key, value] of Object.entries(translations)) {
			this.translations.set(key, value);
		}
		// Prevent the API call from overwriting translations loaded from the dev server
		this.loadingPromise = Promise.resolve();
	}

	/** @internal Load translations from the server */
	private async loadTranslations(): Promise<void> {
		try {
			const response = await fetch(
				`/api/plugins/${this.pluginId}/translations?locale=${this._locale}`
			);

			if (!response.ok) {
				console.warn(`[I18nService] Failed to load translations for ${this.pluginId}`);
				return;
			}

			const data = (await response.json()) as {
				success: boolean;
				translations?: Record<string, string>;
			};

			if (data.success && data.translations) {
				for (const [key, value] of Object.entries(data.translations)) {
					this.translations.set(key, value);
				}
			}
		} catch (error) {
			console.error(`[I18nService] Error loading translations:`, error);
		}
	}

	/** Wait for translations to finish loading from the server. */
	async ready(): Promise<void> {
		if (this.loadingPromise) {
			await this.loadingPromise;
		}
	}

	/**
	 * Resolve a translation key.
	 *
	 * @param key - Translation key (without prefix, e.g. `"title"`)
	 * @param params - Parameters for interpolation
	 * @returns Translated string
	 */
	t(key: string, params?: Record<string, string | number>): string {
		let translation = this.translations.get(key);

		if (!translation) {
			console.warn(`[I18nService] Translation not found: plugin:${this.pluginId}.${key}`);
			return key;
		}

		if (params) {
			for (const [paramKey, paramValue] of Object.entries(params)) {
				translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
			}
		}

		return translation;
	}

	/** Current locale code (e.g. `"hu"`, `"en"`). */
	get locale(): string {
		return this._locale;
	}

	/**
	 * Switch locale and reload translations from the server.
	 * @param newLocale - New locale code
	 */
	async setLocale(newLocale: string): Promise<void> {
		this._locale = newLocale;
		this.translations.clear();
		this.loadingPromise = this.loadTranslations();
		await this.loadingPromise;
	}
}
