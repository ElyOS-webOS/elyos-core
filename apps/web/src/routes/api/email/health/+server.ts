import { json } from '@sveltejs/kit';
import {
	getEmailServiceHealth,
	performEmailHealthCheck,
	isEmailServiceAvailable
} from '$lib/server/email';
import type { RequestHandler } from './$types';

/**
 * GET /api/email/health
 *
 * Returns the current health status of the email service.
 * Includes basic status and optional detailed health check.
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const detailed = url.searchParams.get('detailed') === 'true';

		if (detailed) {
			// Perform comprehensive health check
			const healthCheck = await performEmailHealthCheck();

			return json({
				success: true,
				timestamp: new Date().toISOString(),
				service: 'email',
				detailed: true,
				...healthCheck
			});
		} else {
			// Return basic health status
			const basicHealth = getEmailServiceHealth();

			return json({
				success: true,
				timestamp: new Date().toISOString(),
				service: 'email',
				detailed: false,
				status: basicHealth.status,
				initialized: basicHealth.initialized,
				available: isEmailServiceAvailable(),
				testMode: basicHealth.testMode,

				cacheWarmedUp: basicHealth.cacheWarmedUp,
				error: basicHealth.error
			});
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown health check error';

		return json(
			{
				success: false,
				timestamp: new Date().toISOString(),
				service: 'email',
				status: 'unavailable',
				error: errorMessage
			},
			{ status: 500 }
		);
	}
};
