/**
 * I18n utility-k exportálása
 *
 * @module i18n/utils
 */

// Interpoláció
export {
	interpolate,
	hasInterpolation,
	extractVariables,
	getMissingParams
} from './interpolate.js';

// Plural kezelés
export {
	formatPlural,
	formatPluralSimple,
	hasPlural,
	getPluralCategory,
	type PluralCategory,
	type PluralRules
} from './plural.js';

// Dátum és szám formázás
export {
	formatDate,
	formatNumber,
	formatCurrency,
	formatPercent,
	formatRelativeTime,
	type DateFormatStyle,
	type DateFormatOptions,
	type NumberFormatType,
	type NumberFormatOptions
} from './format.js';

// HTML sanitization
export {
	sanitizeHtml,
	stripHtmlTags,
	isSafeHtml,
	containsDangerousElement,
	containsDangerousAttribute,
	containsDangerousProtocol,
	DANGEROUS_ELEMENTS,
	DANGEROUS_ATTRIBUTES,
	DANGEROUS_PROTOCOLS,
	type DangerousElement,
	type DangerousAttribute,
	type DangerousProtocol
} from './sanitize.js';
