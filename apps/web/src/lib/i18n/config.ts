/**
 * I18n Configuration
 *
 * Központi konfiguráció az i18n rendszerhez.
 * Ez a fájl tartalmazza az összes elérhető nyelvet és azok konfigurációját.
 */

import type { LocaleConfig } from './types.js';

/**
 * Összes elérhető nyelv konfigurációja
 * Itt definiáljuk az összes nyelvet, amit a rendszer támogathat.
 */
export const ALL_AVAILABLE_LOCALES: LocaleConfig[] = [
	{
		code: 'hu',
		name: 'Hungarian',
		nativeName: 'Magyar',
		dateFormat: 'YYYY.MM.DD.',
		numberFormat: { style: 'decimal', minimumFractionDigits: 0 }
	},
	{
		code: 'en',
		name: 'English',
		nativeName: 'English',
		dateFormat: 'MM/DD/YYYY',
		numberFormat: { style: 'decimal', minimumFractionDigits: 0 }
	},
	{
		code: 'de',
		name: 'German',
		nativeName: 'Deutsch',
		dateFormat: 'DD.MM.YYYY',
		numberFormat: { style: 'decimal', minimumFractionDigits: 0 }
	}
];

/**
 * Támogatott nyelvek lekérése ENV alapján (csak szerver oldalon)
 * Kliens oldalon a getSupportedLocales() függvényt használd.
 */
export function getSupportedLocalesFromEnv(): LocaleConfig[] {
	// Csak szerver oldalon érhető el
	if (typeof window !== 'undefined') {
		console.warn('[I18n] getSupportedLocalesFromEnv() called on client side');
		return ALL_AVAILABLE_LOCALES;
	}

	try {
		// Dinamikus import szerver oldalon
		const envModule = require('$lib/env.js');
		const supportedCodes = envModule.env.SUPPORTED_LOCALES || ['hu', 'en'];
		return ALL_AVAILABLE_LOCALES.filter((locale) => supportedCodes.includes(locale.code));
	} catch (error) {
		console.warn('[I18n] Failed to load env config, using all locales:', error);
		return ALL_AVAILABLE_LOCALES;
	}
}

/**
 * Alapértelmezett locale lekérése ENV alapján (csak szerver oldalon)
 */
export function getDefaultLocaleFromEnv(): string {
	// Csak szerver oldalon érhető el
	if (typeof window !== 'undefined') {
		return 'hu';
	}

	try {
		const envModule = require('$lib/env.js');
		return envModule.env.DEFAULT_LOCALE || 'hu';
	} catch (error) {
		return 'hu';
	}
}

/**
 * Támogatott nyelvek szinkron lekérése (kliens és szerver oldalon)
 * Alapértelmezetten az összes nyelvet visszaadja, de a store inicializáláskor
 * beállítható a tényleges támogatott nyelvek listája.
 */
export function getSupportedLocales(supportedCodes?: string[]): LocaleConfig[] {
	if (!supportedCodes || supportedCodes.length === 0) {
		return ALL_AVAILABLE_LOCALES;
	}
	return ALL_AVAILABLE_LOCALES.filter((locale) => supportedCodes.includes(locale.code));
}
