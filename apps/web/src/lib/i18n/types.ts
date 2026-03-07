/**
 * I18n típus definíciók
 */

/**
 * A Translation Store belső állapota
 */
export interface TranslationState {
	locale: string;
	fallbackLocale: string;
	loadedNamespaces: ReadonlySet<string>;
	translations: ReadonlyMap<string, string>;
	loading: boolean;
	error: string | null;
}

/**
 * Nyelv konfiguráció
 */
export interface LocaleConfig {
	code: string;
	name: string;
	nativeName: string;
	dateFormat: string;
	numberFormat: Intl.NumberFormatOptions;
}

/**
 * Fordítás betöltés eredménye
 */
export interface LoadResult {
	translations: Record<string, string>;
	source: 'database';
	loadTime: number;
	fromCache: boolean;
}

/**
 * Cache statisztikák
 */
export interface CacheStats {
	size: number;
	hitRate: number;
	entries: CacheEntry[];
}

/**
 * Cache bejegyzés
 */
export interface CacheEntry {
	key: string;
	loadedAt: number;
	accessCount: number;
	size: number;
}

/**
 * I18n Service konfiguráció
 */
export interface I18nServiceConfig {
	defaultLocale: string;
	fallbackLocale: string;
	supportedLocales: LocaleConfig[];
}

/**
 * Hiányzó fordítás bejegyzés
 */
export interface MissingTranslation {
	key: string;
	locale: string;
	timestamp: number;
}

/**
 * Fordítás paraméterek típusa
 */
export type TranslationParams = Record<string, string | number>;

/**
 * Adatbázis fordítás bejegyzés létrehozási input
 */
export interface CreateTranslationInput {
	locale: string;
	namespace: string;
	key: string;
	value: string;
}

/**
 * Adatbázis fordítás bejegyzés (teljes)
 */
export interface TranslationEntry extends CreateTranslationInput {
	id: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * T.svelte komponens props
 */
export interface TProps {
	key: string;
	params?: TranslationParams;
	tag?: string;
	html?: boolean;
}

/**
 * LocaleSwitcher.svelte komponens props
 */
export interface LocaleSwitcherProps {
	variant?: 'dropdown' | 'buttons' | 'flags';
	showNativeName?: boolean;
	showFullName?: boolean;
	size?: 'sm' | 'default' | 'lg';
}
