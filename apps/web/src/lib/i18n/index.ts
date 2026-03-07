/**
 * I18n Module - Többnyelvű támogatás (csak adatbázis alapú)
 */

// Config
export {
	ALL_AVAILABLE_LOCALES,
	getSupportedLocales,
	getSupportedLocalesFromEnv,
	getDefaultLocaleFromEnv
} from './config.js';

// Service
export { getI18nService, resetI18nService, t, tc, type I18nService } from './service.js';

// Store
export {
	TranslationStore,
	createTranslationStore,
	setTranslationStore,
	getTranslationStore,
	resetTranslationStore,
	DEFAULT_SUPPORTED_LOCALES
} from './store.svelte.js';

// Loader
export {
	getTranslationLoader,
	resetTranslationLoader,
	setDatabaseLoader,
	invalidateTranslationCache,
	getTranslationCacheStats,
	createLoaderCallback,
	type TranslationLoader
} from './loader.js';

// Types
export type {
	TranslationState,
	LocaleConfig,
	TranslationParams,
	MissingTranslation,
	LoadResult,
	CacheStats,
	CacheEntry,
	I18nServiceConfig,
	CreateTranslationInput,
	TranslationEntry,
	TProps,
	LocaleSwitcherProps
} from './types.js';

// Components
export { T, LocaleSwitcher, I18nProvider } from './components/index.js';

// Hooks
export { useI18n, isNamespaceLoaded, areNamespacesLoaded, type UseI18nReturn } from './hooks.js';

// Utils
export {
	interpolate,
	hasInterpolation,
	extractVariables,
	formatPlural,
	hasPlural,
	formatDate,
	formatNumber,
	formatCurrency,
	formatPercent,
	formatRelativeTime,
	sanitizeHtml,
	stripHtmlTags,
	isSafeHtml
} from './utils/index.js';

// Preference
export {
	LOCALE_COOKIE_NAME,
	LOCALE_COOKIE_MAX_AGE,
	DEFAULT_FALLBACK_LOCALE,
	isLocaleSupported,
	parseAcceptLanguage,
	resolveLocale
} from './preference.js';

export {
	getLocaleCookie,
	setLocaleCookie,
	clearLocaleCookie,
	getBrowserLocale
} from './preference.client.js';
