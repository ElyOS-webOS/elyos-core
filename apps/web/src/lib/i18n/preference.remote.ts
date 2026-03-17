/**
 * I18n Preference Remote Functions
 *
 * Szerver oldali függvények a nyelvi preferenciák kezeléséhez.
 * Bejelentkezett felhasználók esetén az adatbázisba menti a beállítást.
 *
 * Requirements: 5.1, 5.2
 */

import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { userRepository } from '$lib/server/database/repositories';
import { isLocaleSupported, LOCALE_COOKIE_NAME, getLocaleCookieOptions } from './preference.js';

/**
 * Locale validációs séma
 */
const setLocaleSchema = v.object({
	locale: v.pipe(
		v.string(),
		v.minLength(2),
		v.maxLength(10),
		v.custom((value) => isLocaleSupported(value as string), 'Unsupported locale')
	)
});

/**
 * Nyelvi preferencia mentése
 *
 * Bejelentkezett felhasználó esetén az adatbázisba menti,
 * vendég esetén cookie-ba.
 *
 * @param input - A beállítandó locale
 * @returns Sikeres mentés esetén a beállított locale
 *
 * Requirements: 5.1, 5.2
 */
export const setLocalePreference = command(setLocaleSchema, async ({ locale }) => {
	const event = getRequestEvent();
	const { locals, cookies } = event;

	// Bejelentkezett felhasználó esetén adatbázisba mentjük
	if (locals.user?.id) {
		const userId = parseInt(locals.user.id);

		// Lekérjük a jelenlegi beállításokat
		const currentSettings = await userRepository.getUserSettings(userId);

		// Frissítjük a locale-t
		const updatedSettings = {
			...currentSettings,
			locale
		};

		// Mentjük az adatbázisba
		await userRepository.updateUserSettings(userId, updatedSettings);

		// Frissítjük a locals-t is
		locals.settings = updatedSettings;
		locals.locale = locale;

		// Cookie-t is beállítjuk, hogy az SDK (plugin oldal) is olvashassa
		const cookieOptions = getLocaleCookieOptions();
		cookies.set(LOCALE_COOKIE_NAME, locale, cookieOptions);

		return {
			success: true,
			locale,
			source: 'database' as const
		};
	}

	// Vendég felhasználó esetén cookie-ba mentjük
	const cookieOptions = getLocaleCookieOptions();
	cookies.set(LOCALE_COOKIE_NAME, locale, cookieOptions);

	// Frissítjük a locals-t
	locals.locale = locale;

	return {
		success: true,
		locale,
		source: 'cookie' as const
	};
});

/**
 * Aktuális nyelvi preferencia lekérése
 *
 * @returns Az aktuális locale és forrása
 */
export const getLocalePreference = command(v.object({}), async () => {
	const event = getRequestEvent();
	const { locals } = event;

	return {
		locale: locals.locale,
		isAuthenticated: !!locals.user?.id
	};
});
