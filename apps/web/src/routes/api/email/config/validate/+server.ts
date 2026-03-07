import { json } from '@sveltejs/kit';
import { validateEmailConfiguration } from '$lib/server/email';
import type { RequestHandler } from './$types';

/**
 * GET /api/email/config/validate
 *
 * Validates the current email configuration and returns detailed results.
 */
export const GET: RequestHandler = async () => {
	try {
		const validation = validateEmailConfiguration();

		return json({
			success: true,
			timestamp: new Date().toISOString(),
			service: 'email-config',
			...validation
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';

		return json(
			{
				success: false,
				timestamp: new Date().toISOString(),
				service: 'email-config',
				valid: false,
				error: errorMessage,
				errors: [errorMessage],
				warnings: [],
				recommendations: []
			},
			{ status: 500 }
		);
	}
};
