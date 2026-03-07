import type { PageServerLoad } from './$types';
import { getEmailServiceState, getEmailServiceHealth } from '$lib/server/email';
import { performEmailHealthCheck } from '$lib/server/email';
import { getEmailManager } from '$lib/server/email';

export const load: PageServerLoad = async () => {
	// Egyszerű állapot
	const state = getEmailServiceState();
	console.log('Initialized:', state.initialized);
	console.log('Degraded:', state.degraded);
	console.log('Cache warmed up:', state.cacheWarmedUp);

	// Részletes health információ
	const health = getEmailServiceHealth();
	console.log('Status:', health.status); // 'healthy' | 'degraded' | 'unavailable'
	console.log('Test mode:', health.testMode);
	console.log('Config:', health.config);

	const healthResult = await performEmailHealthCheck();

	console.log('Overall status:', healthResult.status);
	console.log('Checks:', healthResult.checks);
	console.log('Errors:', healthResult.errors);
	console.log('Warnings:', healthResult.warnings);
	console.log('Metrics:', healthResult.metrics);

	const emailManager = getEmailManager();

	// Template lista lekérése
	const templates = await emailManager?.listTemplates();
	if (templates) {
		console.log('Database templates:', templates.database);
		console.log('Custom templates:', templates.custom);
	}

	return {};
};
