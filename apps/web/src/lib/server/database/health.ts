import { client } from './index';

let lastHealthCheck = 0;
let isHealthy = true;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check database connectivity.
 * @returns {Promise<boolean>} Promise that resolves to true if database is healthy, false otherwise.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
	const now = Date.now();

	// Use cached result if recent
	if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
		return isHealthy;
	}

	try {
		// Simple query to check connection
		await client.query('SELECT 1');
		isHealthy = true;
		lastHealthCheck = now;
		return true;
	} catch (error) {
		console.error('[Database Health] Connection check failed:', error);
		isHealthy = false;
		lastHealthCheck = now;
		return false;
	}
}

/**
 * Throw error if database is not healthy.
 */
export async function ensureDatabaseHealth(): Promise<void> {
	const healthy = await checkDatabaseHealth();
	if (!healthy) {
		throw new Error('Database connection unavailable');
	}
}
