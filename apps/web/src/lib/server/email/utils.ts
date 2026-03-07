import { getEmailManager, isEmailServiceAvailable, isEmailServiceDegraded } from './init';
import type { SendEmailParams, TemplatedEmailParams, EmailResult } from './types';

/**
 * Graceful email sending with degradation handling
 */
export async function sendEmailGracefully(params: SendEmailParams): Promise<EmailResult> {
	const manager = getEmailManager();

	if (!manager || !isEmailServiceAvailable()) {
		console.warn('[EmailUtils] Email service unavailable, email not sent:', {
			to: params.to,
			subject: params.subject
		});

		return {
			success: false,
			error: 'Email service is not available'
		};
	}

	if (isEmailServiceDegraded()) {
		console.warn('[EmailUtils] Email service running in degraded mode');
	}

	try {
		return await manager.sendEmail(params);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[EmailUtils] Email sending failed:', errorMessage);

		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Graceful templated email sending with degradation handling
 */
export async function sendTemplatedEmailGracefully(
	params: TemplatedEmailParams
): Promise<EmailResult> {
	const manager = getEmailManager();

	if (!manager || !isEmailServiceAvailable()) {
		console.warn('[EmailUtils] Email service unavailable, templated email not sent:', {
			to: params.to,
			template: params.template
		});

		return {
			success: false,
			error: 'Email service is not available'
		};
	}

	if (isEmailServiceDegraded()) {
		console.warn('[EmailUtils] Email service running in degraded mode');
	}

	try {
		return await manager.sendTemplatedEmail(params);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[EmailUtils] Templated email sending failed:', errorMessage);

		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Check if email functionality is available
 */
export function canSendEmails(): boolean {
	return isEmailServiceAvailable();
}

/**
 * Get email service status for user-facing messages
 */
export function getEmailServiceStatus(): {
	available: boolean;
	degraded: boolean;
	message: string;
} {
	const available = isEmailServiceAvailable();
	const degraded = isEmailServiceDegraded();

	let message: string;
	if (!available) {
		message = 'Email service is currently unavailable';
	} else if (degraded) {
		message = 'Email service is running with limited functionality';
	} else {
		message = 'Email service is fully operational';
	}

	return {
		available,
		degraded,
		message
	};
}
