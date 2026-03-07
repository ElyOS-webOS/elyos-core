import { command } from '$app/server';
import { reinitializeEmailService } from '$lib/server/email/init';

/**
 * Reinitialize email service - useful when EMAIL_PROVIDER changes
 */
export const reinitializeEmail = command(async () => {
	try {
		console.log('Reinitializing email service...');

		const result = await reinitializeEmailService();

		return {
			success: true,
			message: 'Email service reinitialized successfully',
			state: {
				initialized: result.initialized,
				degraded: result.degraded,
				error: result.error
			}
		};
	} catch (error) {
		console.error('Failed to reinitialize email service:', error);

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			details:
				error instanceof Error
					? {
							name: error.name,
							message: error.message,
							stack: error.stack
						}
					: error
		};
	}
});
