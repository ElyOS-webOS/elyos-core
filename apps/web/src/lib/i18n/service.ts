/**
 * I18n Service - Központi szolgáltatás a fordítások kezeléséhez
 */

import type {
	I18nServiceConfig,
	LocaleConfig,
	TranslationParams,
	MissingTranslation
} from './types.js';
import {
	TranslationStore,
	createTranslationStore,
	getTranslationStore,
	resetTranslationStore,
	DEFAULT_SUPPORTED_LOCALES
} from './store.svelte.js';
import { createLoaderCallback, resetTranslationLoader } from './loader.js';
import { interpolate } from './utils/interpolate.js';
import { formatPlural, hasPlural } from './utils/plural.js';
import { formatDate, formatNumber, formatCurrency } from './utils/format.js';
import type { DateFormatOptions, NumberFormatOptions } from './utils/format.js';

const DEFAULT_CONFIG: I18nServiceConfig = {
	defaultLocale: 'hu',
	fallbackLocale: 'hu',
	supportedLocales: DEFAULT_SUPPORTED_LOCALES
};

class I18nServiceImpl {
	private config: I18nServiceConfig = DEFAULT_CONFIG;
	private store: TranslationStore | null = null;
	private initialized = false;

	async init(config?: Partial<I18nServiceConfig>): Promise<void> {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.store = createTranslationStore(this.config.defaultLocale, this.config.fallbackLocale);
		this.store.setSupportedLocales(this.config.supportedLocales);
		this.store.setLoadNamespaceCallback(createLoaderCallback());
		this.initialized = true;
	}

	private ensureInitialized(): void {
		if (!this.initialized || !this.store) {
			this.store = getTranslationStore();
			if (!this.store) {
				throw new Error('I18n Service is not initialized. Call init() first.');
			}
		}
	}

	t(key: string, params?: TranslationParams): string {
		this.ensureInitialized();
		let translation = this.store!.getTranslation(key, params);

		if (params && translation !== key) {
			translation = interpolate(translation, params);
		}

		return translation;
	}

	tc(key: string, count: number, params?: TranslationParams): string {
		this.ensureInitialized();
		const translation = this.store!.getTranslation(key);

		if (translation === key) return key;

		const allParams: TranslationParams = { count, ...params };
		let result = translation;

		if (hasPlural(translation)) {
			result = formatPlural(translation, allParams, this.getLocale());
		}

		return interpolate(result, allParams);
	}

	formatDate(date: Date | number | string, options?: DateFormatOptions): string {
		this.ensureInitialized();
		return formatDate(date, this.getLocale(), options);
	}

	formatNumber(num: number, options?: NumberFormatOptions): string {
		this.ensureInitialized();
		return formatNumber(num, this.getLocale(), options);
	}

	formatCurrency(amount: number, currency: string): string {
		this.ensureInitialized();
		return formatCurrency(amount, currency, this.getLocale());
	}

	async setLocale(locale: string, persist: boolean = false): Promise<void> {
		this.ensureInitialized();
		await this.store!.setLocale(locale);

		if (persist && typeof document !== 'undefined') {
			const { setLocaleCookie } = await import('./preference.client.js');
			setLocaleCookie(locale);
		}
	}

	getLocale(): string {
		this.ensureInitialized();
		return this.store!.currentLocale;
	}

	getSupportedLocales(): LocaleConfig[] {
		this.ensureInitialized();
		return this.store!.supportedLocales;
	}

	async loadNamespace(namespace: string): Promise<void> {
		this.ensureInitialized();
		await this.store!.loadNamespace(namespace);
	}

	getMissingKeys(): MissingTranslation[] {
		this.ensureInitialized();
		return this.store!.getMissingKeys();
	}

	hasTranslation(key: string): boolean {
		this.ensureInitialized();
		return this.store!.hasTranslation(key);
	}

	getStore(): TranslationStore {
		this.ensureInitialized();
		return this.store!;
	}

	reset(): void {
		this.initialized = false;
		this.store = null;
		resetTranslationStore();
		resetTranslationLoader();
	}
}

let serviceInstance: I18nServiceImpl | null = null;

export function getI18nService(): I18nServiceImpl {
	if (!serviceInstance) {
		serviceInstance = new I18nServiceImpl();
	}
	return serviceInstance;
}

export function resetI18nService(): void {
	if (serviceInstance) {
		serviceInstance.reset();
	}
	serviceInstance = null;
}

export function t(key: string, params?: TranslationParams): string {
	return getI18nService().t(key, params);
}

export function tc(key: string, count: number, params?: TranslationParams): string {
	return getI18nService().tc(key, count, params);
}

export type I18nService = I18nServiceImpl;
