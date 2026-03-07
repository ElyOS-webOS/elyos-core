/**
 * Többes szám kezelés utility a fordításokhoz
 *
 * Támogatja a {count, plural, =0 {...} one {...} other {...}} szintaxist.
 * Az ICU MessageFormat szabványt követi egyszerűsített formában.
 *
 * @module i18n/utils/plural
 */

/**
 * Plural kategóriák típusa
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Plural szabályok locale-onként
 * Egyszerűsített implementáció a magyar és angol nyelvhez
 */
export interface PluralRules {
	/** Locale kód */
	locale: string;
	/** Plural kategória meghatározása a szám alapján */
	select: (count: number) => PluralCategory;
}

/**
 * Alapértelmezett plural szabályok
 * Magyar és angol nyelv támogatása
 */
const PLURAL_RULES: Record<string, (count: number) => PluralCategory> = {
	// Magyar: egyszerű szabály - 1 = one, minden más = other
	hu: (count: number): PluralCategory => {
		if (count === 0) return 'zero';
		if (count === 1) return 'one';
		return 'other';
	},
	// Angol: hasonló a magyarhoz
	en: (count: number): PluralCategory => {
		if (count === 0) return 'zero';
		if (count === 1) return 'one';
		return 'other';
	}
};

/**
 * Alapértelmezett plural szabály (fallback)
 */
const DEFAULT_PLURAL_RULE = (count: number): PluralCategory => {
	if (count === 0) return 'zero';
	if (count === 1) return 'one';
	return 'other';
};

/**
 * Plural kategória meghatározása
 *
 * @param count - A szám, amelyhez a kategóriát meg kell határozni
 * @param locale - A locale kód (pl. "hu", "en")
 * @returns A plural kategória
 */
export function getPluralCategory(count: number, locale: string = 'en'): PluralCategory {
	const rule = PLURAL_RULES[locale] || DEFAULT_PLURAL_RULE;
	return rule(Math.abs(count));
}

/**
 * Plural opciók regex
 * Kigyűjti az egyes opciókat (=0, =1, zero, one, two, few, many, other)
 */
const PLURAL_OPTION_PATTERN = /(=\d+|zero|one|two|few|many|other)\s*\{([^}]*)\}/g;

/**
 * Megkeresi a záró kapcsos zárójelet a plural kifejezéshez
 * Figyelembe veszi a beágyazott kapcsos zárójeleket
 */
function findMatchingBrace(text: string, startIndex: number): number {
	let depth = 1;
	let i = startIndex;

	while (i < text.length && depth > 0) {
		if (text[i] === '{') {
			depth++;
		} else if (text[i] === '}') {
			depth--;
		}
		i++;
	}

	return depth === 0 ? i - 1 : -1;
}

/**
 * Plural kifejezés keresése és feldolgozása
 * Manuális parsing a beágyazott kapcsos zárójelek kezeléséhez
 */
function findPluralExpression(
	text: string,
	startIndex: number = 0
): { match: string; variable: string; options: string; start: number; end: number } | null {
	const pluralStart = text.indexOf(', plural,', startIndex);
	if (pluralStart === -1) return null;

	// Keressük meg a nyitó kapcsos zárójelet a változó előtt
	let braceStart = pluralStart - 1;
	while (braceStart >= 0 && text[braceStart] !== '{') {
		braceStart--;
	}
	if (braceStart < 0) return null;

	// Változó neve
	const variable = text.slice(braceStart + 1, pluralStart).trim();
	if (!/^\w+$/.test(variable)) return null;

	// Opciók kezdete (a ", plural," után)
	const optionsStart = pluralStart + ', plural,'.length;

	// Keressük meg a záró kapcsos zárójelet
	const braceEnd = findMatchingBrace(text, braceStart + 1);
	if (braceEnd === -1) return null;

	const options = text.slice(optionsStart, braceEnd).trim();
	const match = text.slice(braceStart, braceEnd + 1);

	return { match, variable, options, start: braceStart, end: braceEnd + 1 };
}

/**
 * Plural formázás végrehajtása
 *
 * Feldolgozza a {count, plural, =0 {...} one {...} other {...}} szintaxist
 * és visszaadja a megfelelő szöveget a szám alapján.
 *
 * @param text - A szöveg a plural kifejezéssel
 * @param params - A paraméterek (kötelezően tartalmaznia kell a count változót)
 * @param locale - A locale kód a plural szabályokhoz
 * @returns A feldolgozott szöveg
 *
 * @example
 * ```typescript
 * const text = '{count, plural, =0 {Nincs elem} one {# elem} other {# elem}}';
 *
 * formatPlural(text, { count: 0 }, 'hu');
 * // => 'Nincs elem'
 *
 * formatPlural(text, { count: 1 }, 'hu');
 * // => '1 elem'
 *
 * formatPlural(text, { count: 5 }, 'hu');
 * // => '5 elem'
 * ```
 */
export function formatPlural(
	text: string,
	params: Record<string, string | number>,
	locale: string = 'en'
): string {
	let result = text;
	let searchIndex = 0;

	while (true) {
		const expr = findPluralExpression(result, searchIndex);
		if (!expr) break;

		const count = params[expr.variable];

		// Ha a változó nem létezik vagy nem szám, lépjünk tovább
		if (count === undefined || count === null) {
			if (typeof window !== 'undefined' && import.meta.env?.DEV) {
				console.warn(`[i18n] Missing plural variable: "${expr.variable}" in text: "${text}"`);
			}
			searchIndex = expr.end;
			continue;
		}

		const numCount = typeof count === 'string' ? parseFloat(count) : count;

		if (isNaN(numCount)) {
			if (typeof window !== 'undefined' && import.meta.env?.DEV) {
				console.warn(`[i18n] Invalid plural count: "${count}" for variable "${expr.variable}"`);
			}
			searchIndex = expr.end;
			continue;
		}

		// Opciók feldolgozása
		const parsedOptions = parsePluralOptions(expr.options);

		// Megfelelő opció kiválasztása
		const selectedText = selectPluralOption(numCount, parsedOptions, locale);

		// # karakter helyettesítése a számmal
		const replacement = selectedText.replace(/#/g, String(numCount));

		// Csere végrehajtása
		result = result.slice(0, expr.start) + replacement + result.slice(expr.end);

		// Folytatás a csere után
		searchIndex = expr.start + replacement.length;
	}

	return result;
}

/**
 * Plural opciók feldolgozása
 *
 * @param options - A plural opciók stringje
 * @returns A feldolgozott opciók objektuma
 */
function parsePluralOptions(options: string): Record<string, string> {
	const result: Record<string, string> = {};

	// Reset regex lastIndex
	PLURAL_OPTION_PATTERN.lastIndex = 0;

	let match: RegExpExecArray | null;
	while ((match = PLURAL_OPTION_PATTERN.exec(options)) !== null) {
		const [, key, value] = match;
		// Ne trim-eljük az értéket, mert a whitespace is része lehet a fordításnak
		result[key] = value;
	}

	return result;
}

/**
 * Megfelelő plural opció kiválasztása
 *
 * @param count - A szám
 * @param options - A feldolgozott opciók
 * @param locale - A locale kód
 * @returns A kiválasztott szöveg
 */
function selectPluralOption(
	count: number,
	options: Record<string, string>,
	locale: string
): string {
	// Először pontos egyezést keresünk (=0, =1, =2, stb.)
	const exactMatch = options[`=${count}`];
	if (exactMatch !== undefined) {
		return exactMatch;
	}

	// Plural kategória alapján keresünk
	const category = getPluralCategory(count, locale);

	// Kategória szerinti keresés
	if (options[category] !== undefined) {
		return options[category];
	}

	// Fallback az 'other' kategóriára
	if (options['other'] !== undefined) {
		return options['other'];
	}

	// Ha semmi nem található, visszaadjuk az első opciót vagy üres stringet
	const firstOption = Object.values(options)[0];
	return firstOption || '';
}

/**
 * Ellenőrzi, hogy egy szöveg tartalmaz-e plural kifejezést
 *
 * @param text - Az ellenőrizendő szöveg
 * @returns true, ha a szöveg tartalmaz plural kifejezést
 */
export function hasPlural(text: string): boolean {
	return findPluralExpression(text) !== null;
}

/**
 * Egyszerűsített plural formázás (tc függvényhez)
 *
 * Közvetlenül a count értékkel dolgozik, nem kell params objektum.
 *
 * @param text - A szöveg a plural kifejezéssel
 * @param count - A szám
 * @param locale - A locale kód
 * @returns A feldolgozott szöveg
 */
export function formatPluralSimple(text: string, count: number, locale: string = 'en'): string {
	return formatPlural(text, { count }, locale);
}
