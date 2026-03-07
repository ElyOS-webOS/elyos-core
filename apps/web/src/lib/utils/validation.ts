import * as v from 'valibot';

/**
 * @packageDocumentation
 * Közös validációs segédprogramok (szerver és kliens oldalon is használható)
 */

/**
 * Nyelvi lokalizációhoz szükséges típus
 */
export type LocalizedText = {
	hu: string;
	en: string;
	[key: string]: string; // További nyelvek
};

/**
 * Nyelvi lokalizációhoz szükséges validációs valibot schema
 */
export const localizedTextSchema = v.intersect([
	v.object({
		hu: v.pipe(v.string(), v.minLength(1)),
		en: v.pipe(v.string(), v.minLength(1))
	}),
	v.record(v.string(), v.string()) // Bármilyen további nyelv is megengedett
]);
