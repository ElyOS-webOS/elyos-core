/**
 * Dátum és szám formázás utility a fordításokhoz
 *
 * Az Intl API-t használja a locale-specifikus formázáshoz.
 *
 * @module i18n/utils/format
 */

/**
 * Dátum formázási stílusok
 */
export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';

/**
 * Dátum formázási opciók
 */
export interface DateFormatOptions {
	/** Dátum stílus */
	dateStyle?: DateFormatStyle;
	/** Idő stílus */
	timeStyle?: DateFormatStyle;
	/** Egyedi formázási opciók */
	options?: Intl.DateTimeFormatOptions;
}

/**
 * Szám formázási típusok
 */
export type NumberFormatType = 'decimal' | 'currency' | 'percent' | 'unit';

/**
 * Szám formázási opciók
 */
export interface NumberFormatOptions {
	/** Formázási típus */
	type?: NumberFormatType;
	/** Pénznem kód (currency típushoz) */
	currency?: string;
	/** Mértékegység (unit típushoz) */
	unit?: string;
	/** Minimum tizedesjegyek */
	minimumFractionDigits?: number;
	/** Maximum tizedesjegyek */
	maximumFractionDigits?: number;
	/** Egyedi Intl opciók */
	options?: Intl.NumberFormatOptions;
}

/**
 * Locale-specifikus alapértelmezett beállítások
 */
const LOCALE_DEFAULTS: Record<
	string,
	{
		dateOptions: Intl.DateTimeFormatOptions;
		numberOptions: Intl.NumberFormatOptions;
	}
> = {
	hu: {
		dateOptions: {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		},
		numberOptions: {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}
	},
	en: {
		dateOptions: {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		},
		numberOptions: {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}
	}
};

/**
 * Dátum formázása locale-specifikus módon
 *
 * @param date - A formázandó dátum (Date objektum, timestamp vagy ISO string)
 * @param locale - A locale kód (pl. "hu", "en")
 * @param options - Formázási opciók
 * @returns A formázott dátum string
 *
 * @example
 * ```typescript
 * const date = new Date('2024-01-15T10:30:00');
 *
 * formatDate(date, 'hu');
 * // => '2024. 01. 15.'
 *
 * formatDate(date, 'en');
 * // => '01/15/2024'
 *
 * formatDate(date, 'hu', { dateStyle: 'long' });
 * // => '2024. január 15.'
 *
 * formatDate(date, 'hu', { dateStyle: 'short', timeStyle: 'short' });
 * // => '2024. 01. 15. 10:30'
 * ```
 */
export function formatDate(
	date: Date | number | string,
	locale: string = 'en',
	options?: DateFormatOptions
): string {
	// Dátum objektummá alakítás
	const dateObj = toDate(date);

	if (!dateObj || isNaN(dateObj.getTime())) {
		if (typeof window !== 'undefined' && import.meta.env?.DEV) {
			console.warn(`[i18n] Invalid date value: "${date}"`);
		}
		return String(date);
	}

	// Intl opciók összeállítása
	const intlOptions = buildDateFormatOptions(locale, options);

	try {
		const formatter = new Intl.DateTimeFormat(locale, intlOptions);
		return formatter.format(dateObj);
	} catch (error) {
		if (typeof window !== 'undefined' && import.meta.env?.DEV) {
			console.warn(`[i18n] Date formatting error for locale "${locale}":`, error);
		}
		// Fallback: ISO string
		return dateObj.toISOString();
	}
}

/**
 * Szám formázása locale-specifikus módon
 *
 * @param num - A formázandó szám
 * @param locale - A locale kód (pl. "hu", "en")
 * @param options - Formázási opciók
 * @returns A formázott szám string
 *
 * @example
 * ```typescript
 * formatNumber(1234567.89, 'hu');
 * // => '1 234 567,89'
 *
 * formatNumber(1234567.89, 'en');
 * // => '1,234,567.89'
 *
 * formatNumber(0.75, 'hu', { type: 'percent' });
 * // => '75%'
 *
 * formatNumber(1234.5, 'hu', { type: 'currency', currency: 'HUF' });
 * // => '1 235 Ft'
 * ```
 */
export function formatNumber(
	num: number,
	locale: string = 'en',
	options?: NumberFormatOptions
): string {
	if (typeof num !== 'number' || isNaN(num)) {
		if (typeof window !== 'undefined' && import.meta.env?.DEV) {
			console.warn(`[i18n] Invalid number value: "${num}"`);
		}
		return String(num);
	}

	// Intl opciók összeállítása
	const intlOptions = buildNumberFormatOptions(locale, options);

	try {
		const formatter = new Intl.NumberFormat(locale, intlOptions);
		return formatter.format(num);
	} catch (error) {
		if (typeof window !== 'undefined' && import.meta.env?.DEV) {
			console.warn(`[i18n] Number formatting error for locale "${locale}":`, error);
		}
		// Fallback: egyszerű string konverzió
		return String(num);
	}
}

/**
 * Pénznem formázása
 *
 * @param amount - Az összeg
 * @param currency - A pénznem kód (pl. "HUF", "EUR", "USD")
 * @param locale - A locale kód
 * @returns A formázott pénzösszeg
 *
 * @example
 * ```typescript
 * formatCurrency(1234.5, 'HUF', 'hu');
 * // => '1 235 Ft'
 *
 * formatCurrency(1234.5, 'EUR', 'hu');
 * // => '1 234,50 €'
 *
 * formatCurrency(1234.5, 'USD', 'en');
 * // => '$1,234.50'
 * ```
 */
export function formatCurrency(amount: number, currency: string, locale: string = 'en'): string {
	return formatNumber(amount, locale, {
		type: 'currency',
		currency
	});
}

/**
 * Százalék formázása
 *
 * @param value - Az érték (0-1 közötti szám, pl. 0.75 = 75%)
 * @param locale - A locale kód
 * @param fractionDigits - Tizedesjegyek száma
 * @returns A formázott százalék
 *
 * @example
 * ```typescript
 * formatPercent(0.75, 'hu');
 * // => '75%'
 *
 * formatPercent(0.7567, 'hu', 2);
 * // => '75,67%'
 * ```
 */
export function formatPercent(
	value: number,
	locale: string = 'en',
	fractionDigits: number = 0
): string {
	return formatNumber(value, locale, {
		type: 'percent',
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits
	});
}

/**
 * Relatív idő formázása
 *
 * @param date - A dátum
 * @param locale - A locale kód
 * @param baseDate - A referencia dátum (alapértelmezett: most)
 * @returns A relatív idő string (pl. "2 napja", "3 hét múlva")
 *
 * @example
 * ```typescript
 * const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
 * formatRelativeTime(yesterday, 'hu');
 * // => 'tegnap'
 *
 * const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
 * formatRelativeTime(nextWeek, 'hu');
 * // => '1 hét múlva'
 * ```
 */
export function formatRelativeTime(
	date: Date | number | string,
	locale: string = 'en',
	baseDate: Date = new Date()
): string {
	const dateObj = toDate(date);

	if (!dateObj || isNaN(dateObj.getTime())) {
		return String(date);
	}

	const diffMs = dateObj.getTime() - baseDate.getTime();
	const diffSec = Math.round(diffMs / 1000);
	const diffMin = Math.round(diffSec / 60);
	const diffHour = Math.round(diffMin / 60);
	const diffDay = Math.round(diffHour / 24);
	const diffWeek = Math.round(diffDay / 7);
	const diffMonth = Math.round(diffDay / 30);
	const diffYear = Math.round(diffDay / 365);

	try {
		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

		if (Math.abs(diffSec) < 60) {
			return rtf.format(diffSec, 'second');
		} else if (Math.abs(diffMin) < 60) {
			return rtf.format(diffMin, 'minute');
		} else if (Math.abs(diffHour) < 24) {
			return rtf.format(diffHour, 'hour');
		} else if (Math.abs(diffDay) < 7) {
			return rtf.format(diffDay, 'day');
		} else if (Math.abs(diffWeek) < 4) {
			return rtf.format(diffWeek, 'week');
		} else if (Math.abs(diffMonth) < 12) {
			return rtf.format(diffMonth, 'month');
		} else {
			return rtf.format(diffYear, 'year');
		}
	} catch {
		// Fallback: egyszerű dátum formázás
		return formatDate(dateObj, locale);
	}
}

/**
 * Dátum objektummá alakítás
 */
function toDate(date: Date | number | string): Date | null {
	if (date instanceof Date) {
		return date;
	}

	if (typeof date === 'number') {
		return new Date(date);
	}

	if (typeof date === 'string') {
		const parsed = new Date(date);
		return isNaN(parsed.getTime()) ? null : parsed;
	}

	return null;
}

/**
 * Dátum formázási opciók összeállítása
 */
function buildDateFormatOptions(
	locale: string,
	options?: DateFormatOptions
): Intl.DateTimeFormatOptions {
	// Alapértelmezett opciók a locale-hoz
	const defaults = LOCALE_DEFAULTS[locale]?.dateOptions || LOCALE_DEFAULTS['en'].dateOptions;

	// Ha van egyedi options, azt használjuk
	if (options?.options) {
		return options.options;
	}

	// Ha van dateStyle vagy timeStyle, azt használjuk
	if (options?.dateStyle || options?.timeStyle) {
		const result: Intl.DateTimeFormatOptions = {};
		if (options.dateStyle) {
			result.dateStyle = options.dateStyle;
		}
		if (options.timeStyle) {
			result.timeStyle = options.timeStyle;
		}
		return result;
	}

	// Alapértelmezett opciók
	return defaults;
}

/**
 * Szám formázási opciók összeállítása
 */
function buildNumberFormatOptions(
	locale: string,
	options?: NumberFormatOptions
): Intl.NumberFormatOptions {
	// Alapértelmezett opciók a locale-hoz
	const defaults = LOCALE_DEFAULTS[locale]?.numberOptions || LOCALE_DEFAULTS['en'].numberOptions;

	// Ha van egyedi options, azt használjuk
	if (options?.options) {
		return { ...defaults, ...options.options };
	}

	const result: Intl.NumberFormatOptions = { ...defaults };

	// Típus szerinti beállítások
	if (options?.type) {
		switch (options.type) {
			case 'currency':
				result.style = 'currency';
				result.currency = options.currency || 'USD';
				break;
			case 'percent':
				result.style = 'percent';
				break;
			case 'unit':
				result.style = 'unit';
				if (options.unit) {
					result.unit = options.unit;
				}
				break;
			default:
				result.style = 'decimal';
		}
	}

	// Tizedesjegyek beállítása
	if (options?.minimumFractionDigits !== undefined) {
		result.minimumFractionDigits = options.minimumFractionDigits;
	}
	if (options?.maximumFractionDigits !== undefined) {
		result.maximumFractionDigits = options.maximumFractionDigits;
	}

	return result;
}
