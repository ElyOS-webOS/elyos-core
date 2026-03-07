/**
 * I18n Hooks - Egyszerűsített hozzáférés a fordításokhoz.
 */

import { getI18nService } from './service.js';
import { getTranslationStore } from './store.svelte.js';
import type { TranslationParams } from './types.js';

export interface UseI18nReturn {
	/** Fordítás lekérése. */
	t: (key: string, params?: TranslationParams) => string;
	/** Többes számú fordítás. */
	tc: (key: string, count: number, params?: TranslationParams) => string;
	/** Aktuális nyelv kódja. */
	locale: string;
	/** Store közvetlen elérése (haladó használat). */
	store: ReturnType<typeof getTranslationStore>;
	/** Service közvetlen elérése (haladó használat). */
	service: ReturnType<typeof getI18nService>;
}

/**
 * Hook a fordítások egyszerű eléréséhez.
 *
 * Használat I18nProvider-en belül:.
 * ```svelte
 * <script>
 *   import { useI18n } from '$lib/i18n/hooks';
 *   const { t, tc, locale } = useI18n();
 * </script>
 *
 * <h1>{t('settings.title')}</h1>
 * <p>{tc('items.count', 5)}</p>
 * ```
 *
 * Használat I18nProvider nélkül (namespace-t manuálisan kell betölteni):
 * ```svelte
 * <script>
 *   import { useI18n } from '$lib/i18n/hooks';
 *   import { onMount } from 'svelte';
 *
 *   const { t, service, store } = useI18n();
 *   let loaded = $derived(store.loadedNamespaces.has('myNamespace'));
 *
 *   onMount(() => service.loadNamespace('myNamespace'));
 * </script>
 * ```
 */
export function useI18n(): UseI18nReturn {
	const service = getI18nService();
	const store = getTranslationStore();

	return {
		t: (key: string, params?: TranslationParams) => service.t(key, params),
		tc: (key: string, count: number, params?: TranslationParams) => service.tc(key, count, params),
		get locale() {
			return store.currentLocale;
		},
		store,
		service
	};
}

/**
 * Namespace betöltöttségének ellenőrzése.
 * @param namespace
 * @returns
 */
export function isNamespaceLoaded(namespace: string): boolean {
	const store = getTranslationStore();
	return store.loadedNamespaces.has(namespace);
}

/**
 * Több namespace betöltöttségének ellenőrzése.
 * @param namespaces
 * @returns
 */
export function areNamespacesLoaded(namespaces: string[]): boolean {
	const store = getTranslationStore();
	return namespaces.every((ns) => store.loadedNamespaces.has(ns));
}
