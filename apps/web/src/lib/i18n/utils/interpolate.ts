/**
 * Interpoláció utility a fordításokhoz
 *
 * Támogatja a {name} szintaxisú változó behelyettesítést.
 * Hiányzó változók esetén üres stringet helyettesít.
 *
 * @module i18n/utils/interpolate
 */

import type { TranslationParams } from '../types.js';

/**
 * Interpolációs minta regex
 * Illeszkedik a {name} formátumú változókra
 */
const INTERPOLATION_PATTERN = /\{(\w+)\}/g;

/**
 * Interpoláció végrehajtása egy szövegen
 *
 * Helyettesíti a {name} mintákat a megfelelő paraméter értékekkel.
 * Ha egy paraméter hiányzik, üres stringet helyettesít és naplózza a hibát.
 *
 * @param text - A szöveg, amelyben az interpolációt végre kell hajtani
 * @param params - A paraméterek kulcs-érték párjai
 * @returns Az interpolált szöveg
 *
 * @example
 * ```typescript
 * interpolate('Hello, {name}!', { name: 'World' });
 * // => 'Hello, World!'
 *
 * interpolate('You have {count} messages', { count: 5 });
 * // => 'You have 5 messages'
 *
 * interpolate('Hello, {name}!', {});
 * // => 'Hello, !' (hiányzó paraméter esetén üres string)
 * ```
 */
export function interpolate(text: string, params?: TranslationParams): string {
	if (!params || Object.keys(params).length === 0) {
		// Ha nincsenek paraméterek, a változókat üres stringre cseréljük
		return text.replace(INTERPOLATION_PATTERN, () => '');
	}

	return text.replace(INTERPOLATION_PATTERN, (match, key: string) => {
		const value = params[key];

		if (value === undefined || value === null) {
			// Hiányzó paraméter esetén üres string és figyelmeztetés
			if (typeof window !== 'undefined' && import.meta.env?.DEV) {
				console.warn(`[i18n] Missing interpolation parameter: "${key}" in text: "${text}"`);
			}
			return '';
		}

		return String(value);
	});
}

/**
 * Ellenőrzi, hogy egy szöveg tartalmaz-e interpolációs változókat
 *
 * @param text - Az ellenőrizendő szöveg
 * @returns true, ha a szöveg tartalmaz {name} formátumú változókat
 *
 * @example
 * ```typescript
 * hasInterpolation('Hello, {name}!');
 * // => true
 *
 * hasInterpolation('Hello, World!');
 * // => false
 * ```
 */
export function hasInterpolation(text: string): boolean {
	// Reset regex lastIndex (mivel global flag van)
	INTERPOLATION_PATTERN.lastIndex = 0;
	return INTERPOLATION_PATTERN.test(text);
}

/**
 * Kigyűjti az összes interpolációs változó nevét egy szövegből
 *
 * @param text - A szöveg, amelyből a változókat ki kell gyűjteni
 * @returns A változó nevek tömbje (egyedi értékek)
 *
 * @example
 * ```typescript
 * extractVariables('Hello, {name}! You have {count} messages from {name}.');
 * // => ['name', 'count']
 * ```
 */
export function extractVariables(text: string): string[] {
	const variables = new Set<string>();
	let match: RegExpExecArray | null;

	// Reset regex lastIndex
	INTERPOLATION_PATTERN.lastIndex = 0;

	while ((match = INTERPOLATION_PATTERN.exec(text)) !== null) {
		variables.add(match[1]);
	}

	return Array.from(variables);
}

/**
 * Ellenőrzi, hogy az összes szükséges paraméter meg van-e adva
 *
 * @param text - A szöveg az interpolációs változókkal
 * @param params - A megadott paraméterek
 * @returns A hiányzó paraméterek tömbje
 *
 * @example
 * ```typescript
 * getMissingParams('Hello, {name}! You have {count} messages.', { name: 'World' });
 * // => ['count']
 * ```
 */
export function getMissingParams(text: string, params?: TranslationParams): string[] {
	const variables = extractVariables(text);

	if (!params) {
		return variables;
	}

	return variables.filter((variable) => !(variable in params));
}
