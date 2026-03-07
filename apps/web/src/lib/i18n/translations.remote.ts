/**
 * Translation Remote Functions
 *
 * SvelteKit remote functions a fordítások lekéréséhez.
 */

import { command } from '$app/server';
import * as v from 'valibot';
import { translationRepository } from '$lib/server/database/repositories/translationRepository';
import { invalidateTranslationCache as invalidateLoaderCache } from './loader';

const getTranslationsSchema = v.object({
	locale: v.pipe(v.string(), v.minLength(2, 'Locale is required')),
	namespace: v.pipe(v.string(), v.minLength(1, 'Namespace is required'))
});

/**
 * Fordítások lekérése egy adott locale és namespace kombinációhoz
 */
export const getTranslations = command(getTranslationsSchema, async ({ locale, namespace }) => {
	try {
		const translations = await translationRepository.getAsRecord(locale, namespace);
		return {
			success: true,
			translations,
			error: null
		};
	} catch (error) {
		console.error(`[I18n] Failed to get translations for ${locale}/${namespace}:`, error);
		return {
			success: false,
			translations: {} as Record<string, string>,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
});

/**
 * Cache invalidáció (fejlesztéshez hasznos)
 */
export const invalidateCache = command(
	v.object({
		namespace: v.optional(v.string()),
		locale: v.optional(v.string())
	}),
	async ({ namespace, locale }) => {
		try {
			invalidateLoaderCache(namespace, locale);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
);
