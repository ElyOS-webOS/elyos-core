/**
 * I18n Preference Service
 *
 * Kezeli a felhasználói nyelvi preferenciákat:
 * - Bejelentkezett felhasználók: user_settings.settings.locale
 * - Vendég felhasználók: cookie
 * - Fallback: böngésző nyelv vagy alapértelmezett
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { DEFAULT_SUPPORTED_LOCALES } from './store.svelte.js';

/** Cookie neve a nyelvi preferenciához */
export const LOCALE_COOKIE_NAME = 'elyos_locale';

/** Cookie élettartama (1 év) */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Alapértelmezett fallback locale */
export const DEFAULT_FALLBACK_LOCALE = 'hu';

/**
 * Támogatott locale kódok lekérése
 */
export function getSupportedLocaleCodes(): string[] {
	return DEFAULT_SUPPORTED_LOCALES.map((l) => l.code);
}

/**
 * Ellenőrzi, hogy egy locale támogatott-e
 */
export function isLocaleSupported(locale: string): boolean {
	return getSupportedLocaleCodes().includes(locale);
}

/**
 * Locale validálása és normalizálása
 * Ha a locale nem támogatott, null-t ad vissza
 */
export function validateLocale(locale: string | null | undefined): string | null {
	if (!locale) return null;

	// Normalizálás: kisbetűs, csak az első rész (pl. "en-US" -> "en")
	const normalized = locale.toLowerCase().split('-')[0];

	return isLocaleSupported(normalized) ? normalized : null;
}

/**
 * Böngésző Accept-Language header feldolgozása
 * Visszaadja az első támogatott nyelvet
 */
export function parseAcceptLanguage(acceptLanguage: string | null): string | null {
	if (!acceptLanguage) return null;

	// Accept-Language formátum: "hu,en-US;q=0.9,en;q=0.8"
	const languages = acceptLanguage.split(',').map((lang) => {
		const [code] = lang.trim().split(';');
		return code.toLowerCase().split('-')[0];
	});

	// Első támogatott nyelv keresése
	for (const lang of languages) {
		if (isLocaleSupported(lang)) {
			return lang;
		}
	}

	return null;
}

/**
 * Locale preferencia lekérése a prioritás lánc alapján
 *
 * Prioritás: user settings > cookie > browser > fallback
 *
 * @param userLocale - Felhasználói beállításból származó locale
 * @param cookieLocale - Cookie-ból származó locale
 * @param browserLocale - Böngésző Accept-Language header-ből származó locale
 * @param fallbackLocale - Alapértelmezett fallback locale
 * @returns A meghatározott locale
 *
 * Requirements: 5.4
 */
export function resolveLocale(
	userLocale: string | null | undefined,
	cookieLocale: string | null | undefined,
	browserLocale: string | null | undefined,
	fallbackLocale: string = DEFAULT_FALLBACK_LOCALE
): string {
	// 1. User settings (legmagasabb prioritás)
	const validUserLocale = validateLocale(userLocale);
	if (validUserLocale) return validUserLocale;

	// 2. Cookie
	const validCookieLocale = validateLocale(cookieLocale);
	if (validCookieLocale) return validCookieLocale;

	// 3. Browser Accept-Language
	const validBrowserLocale = validateLocale(browserLocale);
	if (validBrowserLocale) return validBrowserLocale;

	// 4. Fallback
	return fallbackLocale;
}

/**
 * Cookie érték generálása a locale-hoz
 */
export function createLocaleCookieValue(locale: string): string {
	return locale;
}

/**
 * Cookie beállítások generálása
 */
export function getLocaleCookieOptions(): {
	path: string;
	maxAge: number;
	httpOnly: boolean;
	secure: boolean;
	sameSite: 'lax' | 'strict' | 'none';
} {
	return {
		path: '/',
		maxAge: LOCALE_COOKIE_MAX_AGE,
		httpOnly: false, // Kliens oldalon is olvasható kell legyen
		secure: true,
		sameSite: 'lax'
	};
}
