import { json } from '@sveltejs/kit';
import { getEmailManager, reinitializeEmailService } from '$lib/server/email';
import type { RequestHandler } from './$types';

/**
 * POST /api/email/validate
 * Validates email service configuration and optionally reinitializes
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { reinitialize = false } = await request.json().catch(() => ({}));

		let manager = getEmailManager();

		// Reinitialize if requested
		if (reinitialize) {
			const state = await reinitializeEmailService();
			manager = state.manager || null;

			return json({
				success: true,
				reinitialized: true,
				initialized: state.initialized,
				degraded: state.degraded,
				error: state.error,
				timestamp: new Date().toISOString()
			});
		}

		// Validate current configuration
		if (!manager) {
			return json({
				success: false,
				error: 'Email service not initialized',
				timestamp: new Date().toISOString()
			});
		}

		const isValid = await manager.validateConfiguration();

		return json({
			success: isValid,
			valid: isValid,
			error: isValid ? undefined : 'Configuration validation failed',
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
