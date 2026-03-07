/**
 * I18n Service
 *
 * Plugin fordítások kezelése.
 * Kulcsok automatikusan prefixelve plugin:{plugin_id} névtérrel.
 */

import type { I18nService as II18nService } from '../../types/index.js';

export class I18nService implements II18nService {
	private readonly pluginId: string;
	private translations: Map<string, string> = new Map();
	private _locale: string = 'en';
	private loadingPromise: Promise<void> | null = null;

	constructor(pluginId: string) {
		this.pluginId = pluginId;
		this.detectLocale();
		this.loadingPromise = this.loadTranslations();
	}

	/** Aktuális nyelv detektálása */
	private detectLocale(): void {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('locale');
			if (stored) {
				this._locale = stored;
				return;
			}
		}
		if (typeof navigator !== 'undefined') {
			this._locale = navigator.language.split('-')[0] ?? 'en';
		}
	}

	/** Fordítások betöltése a szerverről */
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

	/** Várja meg a fordítások betöltését */
	async ready(): Promise<void> {
		if (this.loadingPromise) {
			await this.loadingPromise;
		}
	}

	/**
	 * Fordítási kulcs feloldása
	 *
	 * @param key - Fordítási kulcs (prefix nélkül, pl. "title")
	 * @param params - Paraméterek interpolációhoz
	 * @returns Fordított szöveg
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

	/** Aktuális nyelv */
	get locale(): string {
		return this._locale;
	}

	/** Nyelv váltása és fordítások újratöltése */
	async setLocale(newLocale: string): Promise<void> {
		this._locale = newLocale;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('locale', newLocale);
		}
		this.translations.clear();
		this.loadingPromise = this.loadTranslations();
		await this.loadingPromise;
	}
}
