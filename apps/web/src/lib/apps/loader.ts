/**
 * Alkalmazás betöltő rendszer
 * Fejlett alkalmazás betöltési és cache kezelési funkciók
 *
 * Requirements: 2.3 - App fordítások automatikus betöltése
 */

import type { SvelteComponent } from 'svelte';
import { getI18nService } from '$lib/i18n/service.js';

// App module type for dynamic imports
interface AppModule {
	default: SvelteComponent;
}

// Vite glob importok az alkalmazás modulokhoz
const appComponents = import.meta.glob('/src/apps/*/index.svelte') as Record<
	string,
	() => Promise<AppModule>
>;

export interface LoaderOptions {
	cache: boolean;
	timeout: number;
	retries: number;
	validateComponent: boolean;
	/** Whether to load app translations automatically */
	loadTranslations: boolean;
}

export interface LoadResult {
	success: boolean;
	component?: SvelteComponent;
	loadTime: number;
	fromCache: boolean;
	error?: Error;
	/** Whether translations were loaded for this app */
	translationsLoaded?: boolean;
}

export interface CacheEntry {
	component: SvelteComponent;
	loadedAt: number;
	accessCount: number;
	lastAccessed: number;
	/** Whether translations were loaded for this app */
	translationsLoaded?: boolean;
}

/**
 * Alkalmazás betöltő osztály
 */
export class AppLoader {
	private cache = new Map<string, CacheEntry>();
	private loadingPromises = new Map<string, Promise<LoadResult>>();
	private defaultOptions: LoaderOptions = {
		cache: true,
		timeout: 10000, // 10 másodperc
		retries: 3,
		validateComponent: true,
		loadTranslations: true
	};

	/**
	 * Alkalmazás betöltése.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @returns Betöltési eredmény
	 *
	 * Requirements: 2.3 - Automatikusan betölti az app fordításait
	 */
	async loadApp(appId: string, options: Partial<LoaderOptions> = {}): Promise<LoadResult> {
		const opts = { ...this.defaultOptions, ...options };
		const startTime = Date.now();

		// Ellenőrizzük a cache-t
		if (opts.cache && this.cache.has(appId)) {
			const cacheEntry = this.cache.get(appId)!;
			cacheEntry.accessCount++;
			cacheEntry.lastAccessed = Date.now();

			// Ha a fordítások még nincsenek betöltve és kérjük őket, töltsük be
			if (opts.loadTranslations && !cacheEntry.translationsLoaded) {
				await this.loadAppTranslations(appId);
				cacheEntry.translationsLoaded = true;
			}

			return {
				success: true,
				component: cacheEntry.component,
				loadTime: Date.now() - startTime,
				fromCache: true,
				translationsLoaded: cacheEntry.translationsLoaded
			};
		}

		// Ellenőrizzük, hogy már folyamatban van-e a betöltés
		if (this.loadingPromises.has(appId)) {
			return this.loadingPromises.get(appId)!;
		}

		// Indítsuk el a betöltést
		const loadPromise = this.performLoad(appId, opts, startTime);
		this.loadingPromises.set(appId, loadPromise);

		try {
			const result = await loadPromise;
			return result;
		} finally {
			this.loadingPromises.delete(appId);
		}
	}

	/**
	 * Tényleges betöltés végrehajtása.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @param startTime - Betöltés kezdési ideje
	 * @returns Betöltési eredmény
	 *
	 * Requirements: 2.3 - App fordítások automatikus betöltése
	 */
	private async performLoad(
		appId: string,
		options: LoaderOptions,
		startTime: number
	): Promise<LoadResult> {
		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= options.retries; attempt++) {
			try {
				const result = await this.attemptLoad(appId, options, startTime);

				// Cache-eljük az eredményt, ha sikeres
				if (result.success && result.component && options.cache) {
					// Fordítások betöltése, ha kérjük
					let translationsLoaded = false;
					if (options.loadTranslations) {
						translationsLoaded = await this.loadAppTranslations(appId);
					}

					this.cache.set(appId, {
						component: result.component,
						loadedAt: Date.now(),
						accessCount: 1,
						lastAccessed: Date.now(),
						translationsLoaded
					});

					return {
						...result,
						translationsLoaded
					};
				}

				return result;
			} catch (error) {
				lastError = error as Error;

				// Ha nem az utolsó próbálkozás, várjunk egy kicsit
				if (attempt < options.retries) {
					await this.delay(1000 * attempt); // Exponenciális backoff
				}
			}
		}

		return {
			success: false,
			loadTime: Date.now() - startTime,
			fromCache: false,
			error: lastError || new Error('Ismeretlen hiba a betöltés során')
		};
	}

	/**
	 * Egy betöltési kísérlet.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @param startTime - Betöltés kezdési ideje
	 * @returns Betöltési eredmény
	 */
	private async attemptLoad(
		appId: string,
		options: LoaderOptions,
		startTime: number
	): Promise<LoadResult> {
		// Timeout kezelés
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Betöltési timeout')), options.timeout);
		});

		const loadPromise = this.doLoad(appId, options);

		const result = await Promise.race([loadPromise, timeoutPromise]);
		return {
			...result,
			loadTime: Date.now() - startTime,
			fromCache: false
		};
	}

	/**
	 * Tényleges betöltési logika.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @returns Betöltési eredmény (idő és cache információk nélkül)
	 */
	private async doLoad(
		appId: string,
		options: LoaderOptions
	): Promise<Omit<LoadResult, 'loadTime' | 'fromCache'>> {
		try {
			// Próbáljuk betölteni az alkalmazás modult
			const componentKey = `/src/apps/${appId}/index.svelte`;
			const componentLoader = appComponents[componentKey];

			if (!componentLoader) {
				throw new Error(`Alkalmazás modul nem található: ${appId}`);
			}

			const appModule = await componentLoader();

			if (!appModule.default) {
				throw new Error('Az alkalmazás modul nem tartalmaz default exportot');
			}

			// Komponens validálás
			if (options.validateComponent && !this.validateComponent(appModule.default)) {
				throw new Error('Érvénytelen alkalmazás komponens');
			}

			return {
				success: true,
				component: appModule.default
			};
		} catch (error) {
			throw new Error(`Hiba az alkalmazás betöltése során: ${appId} - ${error}`);
		}
	}

	/**
	 * Komponens validálása.
	 * @param component - A validálandó komponens
	 * @returns True, ha érvényes komponens
	 */
	private validateComponent(component: unknown): boolean {
		// Alapvető Svelte komponens ellenőrzés
		return typeof component === 'function' || (typeof component === 'object' && component !== null);
	}

	/**
	 * Késleltetés segédfunkció.
	 * @param ms - Késleltetés milliszekundumban
	 * @returns Promise, amely a megadott idő után teljesül
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * App fordítások betöltése.
	 *
	 * Automatikusan betölti az app fordításait az i18n service-en keresztül.
	 * A fordítások az app namespace-ben lesznek elérhetők.
	 *
	 * @param appId - Az alkalmazás azonosítója
	 * @returns True, ha a fordítások sikeresen betöltődtek
	 *
	 * Requirements: 2.3 - App fordítások automatikus betöltése
	 */
	private async loadAppTranslations(appId: string): Promise<boolean> {
		try {
			const i18nService = getI18nService();
			await i18nService.loadNamespace(appId);
			return true;
		} catch (error) {
			// Fordítás betöltési hiba nem akadályozza az app betöltését
			console.warn(`Failed to load translations for app: ${appId}`, error);
			return false;
		}
	}

	/**
	 * Cache tisztítása.
	 * @param appId - Opcionális alkalmazás azonosító (ha nincs megadva, az összes törlődik)
	 */
	clearCache(appId?: string): void {
		if (appId) {
			this.cache.delete(appId);
		} else {
			this.cache.clear();
		}
	}

	/**
	 * Cache statisztikák.
	 * @returns Cache statisztikai adatok
	 */
	getCacheStats(): {
		size: number;
		entries: Array<{
			appId: string;
			loadedAt: number;
			accessCount: number;
			lastAccessed: number;
		}>;
	} {
		const entries: Array<{
			appId: string;
			loadedAt: number;
			accessCount: number;
			lastAccessed: number;
		}> = [];

		this.cache.forEach((entry, appId) => {
			entries.push({
				appId,
				loadedAt: entry.loadedAt,
				accessCount: entry.accessCount,
				lastAccessed: entry.lastAccessed
			});
		});

		return {
			size: this.cache.size,
			entries
		};
	}

	/**
	 * Cache karbantartás (régi bejegyzések eltávolítása).
	 * @param maxAge - Maximális életkor milliszekundumban (alapértelmezett: 30 perc)
	 */
	maintainCache(maxAge: number = 30 * 60 * 1000): void {
		// 30 perc alapértelmezett
		const now = Date.now();
		const toDelete: string[] = [];

		this.cache.forEach((entry, appId) => {
			if (now - entry.lastAccessed > maxAge) {
				toDelete.push(appId);
			}
		});

		toDelete.forEach((appId) => this.cache.delete(appId));
	}

	/**
	 * Alkalmazás előzetes betöltése.
	 * @param appId - Az alkalmazás azonosítója
	 * @returns True, ha a betöltés sikeres volt
	 */
	async preloadApp(appId: string): Promise<boolean> {
		try {
			const result = await this.loadApp(appId, { cache: true });
			return result.success;
		} catch {
			return false;
		}
	}

	/**
	 * Több alkalmazás előzetes betöltése.
	 * @param appIds - Az alkalmazások azonosítóinak listája
	 * @returns Objektum az alkalmazás azonosítókkal és betöltési eredményekkel
	 */
	async preloadApps(appIds: string[]): Promise<Record<string, boolean>> {
		const results: Record<string, boolean> = {};

		const promises = appIds.map(async (appId) => {
			results[appId] = await this.preloadApp(appId);
		});

		await Promise.all(promises);
		return results;
	}
}

// Globális betöltő példány
export const appLoader = new AppLoader();
