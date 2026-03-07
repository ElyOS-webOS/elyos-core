/**
 * Hello World Plugin - Server Functions
 *
 * Ezek a függvények a szerveren futnak és a Remote Service-en keresztül hívhatók.
 */

/**
 * Szerver idő lekérdezése
 *
 * @param {Object} params - Paraméterek
 * @param {string} params.format - Formátum (ISO, timestamp, locale)
 * @param {Object} context - Execution context
 * @param {string} context.pluginId - Plugin azonosítója
 * @param {string} context.userId - Felhasználó azonosítója
 * @param {Object} context.db - Adatbázis kapcsolat
 * @returns {Object} Szerver idő információk
 */
export async function getServerTime(params, context) {
	const now = new Date();
	const format = params?.format || 'ISO';

	console.log(`[${context.pluginId}] getServerTime called by user ${context.userId}`);

	const result = {
		timestamp: now.getTime(),
		iso: now.toISOString(),
		locale: now.toLocaleString('hu-HU'),
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		format: format
	};

	// Formátum szerint visszaadás
	switch (format) {
		case 'timestamp':
			return { time: result.timestamp };
		case 'locale':
			return { time: result.locale };
		case 'ISO':
		default:
			return result;
	}
}

/**
 * Felhasználó statisztikák lekérdezése
 *
 * @param {Object} params - Paraméterek
 * @param {Object} context - Execution context
 * @returns {Object} Statisztikák
 */
export async function getUserStats(params, context) {
	const { db, pluginId, userId } = context;

	try {
		// Lekérdezzük a plugin adatait a kv_store táblából
		const result = await db.execute(`
			SELECT COUNT(*) as total_keys
			FROM plugin_${pluginId}.kv_store
		`);

		return {
			userId,
			pluginId,
			totalKeys: result.rows[0]?.total_keys || 0,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		console.error('Error getting user stats:', error);
		throw new Error('Failed to get user stats');
	}
}

/**
 * Egyszerű számítás példa
 *
 * @param {Object} params - Paraméterek
 * @param {number} params.a - Első szám
 * @param {number} params.b - Második szám
 * @param {string} params.operation - Művelet (add, subtract, multiply, divide)
 * @returns {Object} Számítás eredménye
 */
export async function calculate(params) {
	const { a, b, operation } = params;

	if (typeof a !== 'number' || typeof b !== 'number') {
		throw new Error('Parameters a and b must be numbers');
	}

	let result;
	switch (operation) {
		case 'add':
			result = a + b;
			break;
		case 'subtract':
			result = a - b;
			break;
		case 'multiply':
			result = a * b;
			break;
		case 'divide':
			if (b === 0) {
				throw new Error('Division by zero');
			}
			result = a / b;
			break;
		default:
			throw new Error('Invalid operation. Use: add, subtract, multiply, divide');
	}

	return {
		a,
		b,
		operation,
		result
	};
}
