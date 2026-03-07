/**
 * @packageDocumentation
 * Adatbázis kapcsolatos szerver oldali segédprogramok
 */

/**
 * SQL lekérdezés hibák kezelése
 */
export function handleDatabaseError(error: unknown): string {
	if (error instanceof Error) {
		// PostgreSQL specifikus hibakódok
		if ('code' in error) {
			const pgError = error as { code: string; detail?: string };
			switch (pgError.code) {
				case '23505': // unique_violation
					return 'Az adat már létezik az adatbázisban';
				case '23503': // foreign_key_violation
					return 'Hivatkozott adat nem található';
				case '23502': // not_null_violation
					return 'Kötelező mező hiányzik';
				case '23514': // check_violation
					return 'Adatvalidációs hiba';
				default:
					return `Adatbázis hiba: ${error.message}`;
			}
		}
		return `Adatbázis hiba: ${error.message}`;
	}
	return 'Ismeretlen adatbázis hiba';
}

/**
 * Biztonságos SQL paraméter validálás
 */
export function sanitizeSqlParameter(value: unknown): string | number | boolean | null {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === 'string') {
		// Alapvető SQL injection védelem
		return value.replace(/['"\\]/g, '');
	}

	if (typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}

	return String(value).replace(/['"\\]/g, '');
}

/**
 * Lapozási paraméterek validálása
 */
export function validatePaginationParams(
	page?: number,
	limit?: number
): { page: number; limit: number; offset: number } {
	const validatedPage = Math.max(1, page || 1);
	const validatedLimit = Math.min(100, Math.max(1, limit || 10));
	const offset = (validatedPage - 1) * validatedLimit;

	return {
		page: validatedPage,
		limit: validatedLimit,
		offset
	};
}
