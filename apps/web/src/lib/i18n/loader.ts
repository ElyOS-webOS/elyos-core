/**
 * Translation Loader
 *
 * Fordítások betöltése adatbázisból.
 * Támogatja a lazy loading-ot és cache-elést.
 */

import type { LoadResult, CacheStats, CacheEntry } from './types.js';

/**
 * Cache bejegyzés belső reprezentációja
 */
interface InternalCacheEntry {
	translations: Record<string, string>;
	loadedAt: number;
	accessCount: number;
}

/**
 * Adatbázis betöltő függvény típusa
 */
type DatabaseLoader = (
	locale: string,
	namespace: string
) => Promise<{ success: boolean; translations: Record<string, string>; error: string | null }>;

/**
 * Translation Loader osztály
 *
 * Singleton minta a globális cache kezeléshez
 */
class TranslationLoaderImpl {
	private cache: Map<string, InternalCacheEntry> = new Map();
	private cacheHits = 0;
	private cacheMisses = 0;
	private databaseLoader: DatabaseLoader | null = null;

	/**
	 * Adatbázis betöltő beállítása
	 */
	setDatabaseLoader(loader: DatabaseLoader): void {
		this.databaseLoader = loader;
	}

	/**
	 * Cache kulcs generálása
	 */
	private getCacheKey(locale: string, namespace: string): string {
		return `${locale}:${namespace}`;
	}

	/**
	 * Fordítások betöltése adatbázisból
	 */
	async load(locale: string, namespace: string): Promise<LoadResult> {
		const startTime = performance.now();
		const key = this.getCacheKey(locale, namespace);

		// Cache ellenőrzése
		const cached = this.cache.get(key);
		if (cached) {
			this.cacheHits++;
			cached.accessCount++;

			return {
				translations: cached.translations,
				source: 'database',
				loadTime: performance.now() - startTime,
				fromCache: true
			};
		}

		this.cacheMisses++;

		// Adatbázisból betöltés
		let translations: Record<string, string> = {};

		if (this.databaseLoader) {
			try {
				const result = await this.databaseLoader(locale, namespace);
				if (result.success) {
					translations = result.translations;
				} else if (result.error) {
					console.warn(`[I18n] Database load warning for ${locale}:${namespace}: ${result.error}`);
				}
			} catch (error) {
				console.error(`[I18n] Failed to load translations for ${locale}:${namespace}:`, error);
			}
		} else {
			console.warn('[I18n] Database loader not set. Call setDatabaseLoader first.');
		}

		// Cache-be mentés
		this.cache.set(key, {
			translations,
			loadedAt: Date.now(),
			accessCount: 1
		});

		return {
			translations,
			source: 'database',
			loadTime: performance.now() - startTime,
			fromCache: false
		};
	}

	/**
	 * Cache invalidálása
	 */
	invalidateCache(namespace?: string, locale?: string): void {
		if (namespace && locale) {
			const key = this.getCacheKey(locale, namespace);
			this.cache.delete(key);
		} else if (locale) {
			for (const key of this.cache.keys()) {
				if (key.startsWith(`${locale}:`)) {
					this.cache.delete(key);
				}
			}
		} else if (namespace) {
			for (const key of this.cache.keys()) {
				if (key.endsWith(`:${namespace}`)) {
					this.cache.delete(key);
				}
			}
		} else {
			this.cache.clear();
			this.cacheHits = 0;
			this.cacheMisses = 0;
		}
	}

	/**
	 * Cache statisztikák lekérése
	 */
	getCacheStats(): CacheStats {
		const entries: CacheEntry[] = [];

		for (const [key, entry] of this.cache.entries()) {
			entries.push({
				key,
				loadedAt: entry.loadedAt,
				accessCount: entry.accessCount,
				size: JSON.stringify(entry.translations).length
			});
		}

		const totalRequests = this.cacheHits + this.cacheMisses;
		const hitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;

		return {
			size: this.cache.size,
			hitRate,
			entries
		};
	}

	/**
	 * Cache teljes törlése
	 */
	clearCache(): void {
		this.cache.clear();
		this.cacheHits = 0;
		this.cacheMisses = 0;
	}
}

// Singleton példány
let loaderInstance: TranslationLoaderImpl | null = null;

/**
 * Translation Loader singleton lekérése
 */
export function getTranslationLoader(): TranslationLoaderImpl {
	if (!loaderInstance) {
		loaderInstance = new TranslationLoaderImpl();
	}
	return loaderInstance;
}

/**
 * Translation Loader visszaállítása (teszteléshez)
 */
export function resetTranslationLoader(): void {
	if (loaderInstance) {
		loaderInstance.clearCache();
	}
	loaderInstance = null;
}

/**
 * Adatbázis betöltő beállítása
 */
export function setDatabaseLoader(loader: DatabaseLoader): void {
	getTranslationLoader().setDatabaseLoader(loader);
}

/**
 * Cache invalidálása
 */
export function invalidateTranslationCache(namespace?: string, locale?: string): void {
	getTranslationLoader().invalidateCache(namespace, locale);
}

/**
 * Cache statisztikák lekérése
 */
export function getTranslationCacheStats(): CacheStats {
	return getTranslationLoader().getCacheStats();
}

/**
 * Loader callback létrehozása a Translation Store számára
 */
export function createLoaderCallback(): (
	namespace: string,
	locale: string
) => Promise<Record<string, string>> {
	return async (namespace: string, locale: string): Promise<Record<string, string>> => {
		const result = await getTranslationLoader().load(locale, namespace);
		return result.translations;
	};
}

export type TranslationLoader = TranslationLoaderImpl;
